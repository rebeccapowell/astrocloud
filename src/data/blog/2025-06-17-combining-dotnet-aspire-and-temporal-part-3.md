---
id: 10001
title: "Combining .NET Aspire with Temporal - Part 3"
pubDatetime: 2025-06-17T16:55:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=10000"
slug: 2025-06-17-combining-dotnet-aspire-and-temporal-part-3
description: Part 3 of a multi-part blog series on Temporal with .NET Aspire.
featured: false
draft: false
categories:
  - work
tags:
  - dotnet
  - aspire
  - temporal
  - docker
  - codec
  - encryption
---

## Building a Distributed Workflow App with .NET Aspire and Temporal

### Part 3: Securing Workflow State with Payload Encryption and Codec Servers

In the [first post](/posts/2025-06-09-combining-dotnet-aspire-and-temporal-part-1/), I showed you how to put together a resilient, distributed workflow-powered example application using [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/overview) and [Temporal.io](https://temporal.io/). The [second article](/posts/2025-06-15-combining-dotnet-aspire-and-temporal-part-2/) focused on deployment strategies to Kubernetes. Now, in this third part, we return to the application itself, diving into how to secure sensitive state and workflow data using encryption.

If you're new to the series or the broader topic of distributed systems, you might want to begin with [my primer on the evolution of building fault tolerant resilient distributed systems](/posts/2025-06-14-the-five-waves-of-distributed-resilience/).

The code for this blog post can be found on my [Github repo `aspire-temporal-three`](https://github.com/rebeccapowell/aspire-temporal-three).

---

### Why Secure Payloads in Temporal

Temporal transmits workflow and activity data (payloads) between the client, server, and workers. These payloads are stored in Temporal's backing data store, meaning potentially sensitive data such as user details, internal state, or business logic inputs/outputs are persisted.

When using Temporal Cloud, your data may be stored outside of your jurisdiction unless you explicitly select a regional deployment (currently Europe-hosted backends are supported, but the UI is still US-based). For compliance-heavy environments (especially in the EU), securing data in motion and at rest is crucial. Self-hosting doesn't exempt you either: insider risk and misconfigurations are ever-present threats.

Encryption helps address this, especially when combined with codec servers that allow the Temporal UI to display decrypted payloads for debugging without ever giving Temporal itself access to the raw values (requests go from client-side i.e. Temporal UI, to your codec server).

Note that you could work around this issue by avoiding putting Personal Identifiable Information (PII) classified under GDPR rules in workflow payloads / state. However it just takes one mistake by a developer to leak PII outside of EU jurisdiction and you have a violation.

You could also work around this by using an activity-isolated data pattern. That is to say that rather than passing data in the state / payloads, you pass references to that data in your datastores (i.e. the CustomerId rather than the customer's name), and then in your activity (which is isolated in your own workers), you first retrieve the data, process it and then give a result back to the workflow. You _can_ do this, but the same issue as above exists. It's also an _anti-pattern_, in that our activities need to be idempotent. They have to abide by what I call the **write-once-write-last** principle or **WOWL**, which addresses the **dual write problem**. As a naïve example, your activity can do this:

```csharp
[Activity]
public async Task MarkAsPaid(Guid customerId)
{
	var customer = await _customerRepo.GetAsync(customerId);
	customer.SetStatus(Status.Paid);

	await _customerRepo.UpdateAsync(customer);
}
```

But it can't do this safely:

```csharp
[Activity]
public async Task MarkAsPaid(Guid customerId, Guid userId)
{
	var customer = await _customerRepo.GetAsync(customerId);
	customer.SetStatus(Status.Paid);

	await _customerRepo.UpdateAsync(customer);

	// this could error, so the customer has paid, but no audit log
	await _auditRepo.CreateAsync($"Customer updated by {userId}");
	// on retry the status is marked as paid again
	// this can have undesired side effects
}
```

Simply because if the second write fails, the first one has already taken place. Also worth mentioning that at some point someone will do this:

```csharp
[Activity]
public async Task<Customer> CreateCustomer(string customerName, Guid userId)
{
	var customer = new Customer(customerName);
	await _customerRepo.CreateAsync(customer);

	// this could error, so the customer has been created, but no audit log
	await _auditRepo.CreateAsync($"Customer created by {userId}");
	// on retry, we get a duplicate customer, and we've leaked the PII

	return customer;
}
```

Hopefully through those examples you can see why (especially in the Temporal Cloud), payload encryption is important.

Note that the workaround for these kinds of failures has typically been the outbox pattern to resolve a potential inconsistent system state. There were also early experiments with distributed transactions, but for anyone that has worked with those, say for example with NServiceBus in the early days, you'll know how flaky and problematic MSDTC was.

The outbox pattern was a pragmatic solution for a difficult problem, but it also had it's own set of problems (stuck outbox rows, added complexity, polling loops, deduping, and eventual delivery). In durable execution state persitence and message delivery are unified. One could argue that it is in itself an abstraction of the outbox pattern, at least follows in it's footsteps, but Temporal does this under the hood as part of the paltform itself and takes that one step further with its state tracking to pick up where it last failed, with built in retry patterns for resilience for almost guaranteed durability.

---

### Payload Encryption in Temporal

Temporal supports pluggable data conversion mechanisms via the `IPayloadCodec` interface [in the .NET SDK](https://docs.temporal.io/develop/dotnet/converters-and-encryption). This allows you to encrypt and decrypt payloads transparently without changing your workflows.

Our implementation uses [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) (Galois/Counter Mode), a widely adopted authenticated encryption algorithm known for its performance and security. It provides both confidentiality and integrity, which means the data is encrypted and any tampering can be detected. It is a symmetric-key based algorithm.

We use 256-bit keys retrieved from Azure Key Vault or a local [Azure Keyvault Emulator](https://github.com/james-gould/azure-keyvault-emulator), which is an open source project for local development. Each encrypted payload includes metadata that stores the encryption key ID used.

An "initialization vector (IV)"—the random component that ensures each encryption of the same plaintext produces different ciphertext.

---

### Encryption and Decryption Implementation Details

Let’s walk through the actual implementation:

```csharp
private const int IvSize = 12;
private const int TagSize = 16; // Authentication tag for AES-GCM

private static byte[] Encrypt(byte[] data, byte[] key)
{
    var iv = RandomNumberGenerator.GetBytes(IvSize);
    var ciphertext = new byte[data.Length];
    var tag = new byte[TagSize];

    using var aes = new AesGcm(key);
    aes.Encrypt(iv, data, ciphertext, tag);

    // Combine IV + ciphertext + tag into a single byte[]
    return iv.Concat(ciphertext).Concat(tag).ToArray();
}

private static byte[] Decrypt(byte[] encrypted, byte[] key)
{
    var iv = encrypted.AsSpan(0, IvSize).ToArray();
    var ciphertext = encrypted.AsSpan(IvSize, encrypted.Length - IvSize - TagSize).ToArray();
    var tag = encrypted.AsSpan(encrypted.Length - TagSize, TagSize).ToArray();
    var plaintext = new byte[ciphertext.Length];

    using var aes = new AesGcm(key);
    aes.Decrypt(iv, ciphertext, tag, plaintext);
    return plaintext;
}
```

We prepend the IV and append the authentication tag to the ciphertext. This composite format ensures decryptors have all necessary components to reconstruct the plaintext.

Why AES-GCM?

- **Fast** and hardware-accelerated on most CPUs
- **Secure**, widely analyzed and trusted
- **Single-pass** over the data, which is important for large payloads
- **Built-in integrity** verification using the authentication tag

The encoded result is stored in the `Payload.Data` field, and the metadata (`Payload.Metadata`) contains the `key-id` and `encoding` format.

---

### Key Rotation Considerations

Let’s say your current active key is `key1`. Eventually you decide to rotate and add `key2`. New payloads will be encrypted using `key2`, but older payloads will remain encrypted using `key1`.

Since workflow instances can run for a long time, this can be a problem. Common use cases for Temporal workflows could be things like:

- Give the customer a 60 day trial period, send a reminder after 30 days and if they don't sign up, delete their account
- The customer has a two year contract with our organization and we want to automatically send them a renewal contract 30 days before the end of the two years.
- We must hold the customer's data legally for 4 years after their contract has ended for legal reasons, and we delete all data after that date.

This means that workflow instances could live for years, although most will be short, you cannot guarantee it. Therefore we need a solution to roll keys but keep them around, or migrate the payloads via workflow updates.

The codec handles this by checking the `key-id` in the metadata. This decouples encoding from decoding and ensures older data is still accessible:

```json
{
  "metadata": {
    "encoding": "binary/encrypted",
    "key-id": "key1"
  },
  "data": "<ciphertext>"
}
```

Keyvault supports tagging of keys (i.e. grouping them together) and querying by that tag. I therefore recommend tagging secrets in Key Vault with a `namespace` tag to allow filtering and bulk cache loading:

```csharp
await foreach (var prop in _client.GetPropertiesOfSecretsAsync())
{
    if (prop.Tags["namespace"] == Constants.Namespace)
    {
        var secret = await _client.GetSecretAsync(prop.Name);
        _cache[id] = Convert.FromBase64String(secret.Value.Value);
    }
}
```

You should monitor which keys are in use by logging the key ID during encoding/decoding. Expire old keys only after ensuring no running workflows depend on them.

---

### Where to Store Keys

For production:

- Use **Azure Key Vault** for key material.
- Tag your secrets with the `namespace` used in your Temporal deployment.
- Enable RBAC and audit logs.

For local development:

```xml
<PackageReference Include="AzureKeyVaultEmulator.Client" Version="2.3.2" />
<PackageReference Include="AzureKeyVaultEmulator.Aspire.Hosting" Version="2.3.2" />
```

In your `AppHost` project:

```csharp
var keyVault = builder
    .AddAzureKeyVault("keyvault")
    .RunAsEmulator();

keyVault.PublishAsConnectionString();
```

And in `Program.cs`:

```csharp
builder.Services.AddAzureKeyVaultEmulator(vaultUri, secrets: true, keys: true, certificates: false);
```

Keyvault is seeded (and the Redis cache) when the application starts using the KeyvaultSeeder, which runs as a container and both the API and the Worker are set to wait until the seeder has finished and exited:

```csharp
static async Task SeedAsync(SecretClient client, IConnectionMultiplexer redis)
{
	if (!await AnyKeyExistsAsync(client))
	{
		var id = CreateKeyId();
		await SetKeyAsync(client, id);
		Console.WriteLine($"Seeded {id}");
	}
	else
	{
		Console.WriteLine("Key vault already seeded");
	}

	await UpdateCacheAsync(client, redis);
}
```

This will ensure at least one active `key-id` is present on boot.

---

### Implementing a Codec Server for Temporal

The codec server is a simple ASP.NET minimal API app with two endpoints that decode/encode payloads. Here's the endpoint logic:

```csharp
app.MapPost("/encode", async (HttpContext ctx, KeyVaultEncryptionCodec codec) =>
{
    var payloads = await ReadPayloadsAsync(ctx.Request.Body);
    var encoded = await codec.EncodeAsync(payloads.Payloads_);
    return Results.Text(JsonFormatter.Default.Format(new Payloads { Payloads_ = { encoded } }), "application/json");
});

app.MapPost("/decode", async (HttpContext ctx, KeyVaultEncryptionCodec codec) =>
{
    var payloads = await ReadPayloadsAsync(ctx.Request.Body);
    var decoded = await codec.DecodeAsync(payloads.Payloads_);
    return Results.Text(JsonFormatter.Default.Format(new Payloads { Payloads_ = { decoded } }), "application/json");
});
```

Don't forget to enable CORS:

```csharp
app.UseCors(builder => builder
    .WithOrigins("http://localhost:8233", "https://cloud.temporal.io")
    .WithHeaders("content-type", "x-namespace")
    .WithMethods("POST"));
```

This allows the Temporal UI to make cross-origin calls to your local or deployed codec server.

---

### Putting It All Together

The full encryption pipeline includes:

1. **AppHost:** Boots the app with Aspire and provisions a local Key Vault emulator.
2. **API and Worker:** Inject the `KeyVaultEncryptionCodec` into the Temporal client registration.
3. **Codec Server:** Serves `/encode` and `/decode` for UI interop.
4. **Workflow Execution:** Encrypts all payloads before storage.
5. **Temporal UI:** Transparently decrypts via the registered codec server.

This ensures that sensitive data is always encrypted at rest, while still being debuggable and testable via the browser-based Temporal UI.

---

### Example Flow

Here's what a full request/response cycle looks like:

- **User triggers workflow** via API:

```bash
curl -X POST http://localhost:5000/trigger -H "Content-Type: application/json" -d '{ "input": "secret" }'
```

- **Worker receives encrypted payload:**

```json
{
  "metadata": {
    "encoding": "binary/encrypted",
    "encryption-key-id": "key1"
  },
  "data": "<ciphertext>"
}
```

- **Temporal UI initially shows encrypted blobs** until you register the codec server URL.
- **UI then decrypts content live** by calling your `/decode` endpoint client-side.

---

### Walking through a key-rollover

Let's walkthrough how we would create a new version of the keys being used, and still supporting payloads in ongoing workflows that were encrypted with an older keys. Our workflow is more or less this in its most simplistic form:

- Start workflow 1
- Roll keys
- Start workflow 2
- Signal workflow 2
- Finalize workflow 2
- Signal workflow 1
- Finalize workflow 1

Let's follow this through.

---

First we see the new containers added from the first demo. I've also included Redis Commander so we can take a look at the values in the databsse via a UI.

![aspire dashboard](/assets/posts/aspire-three-dashboard.png)

Next we open the Swagger end point and kick off the first workflow:

![start workflow 1](/assets/posts/aspire-three-start-1.png)

Now we roll the keys over to a new active key:

![swagger roll keys](/assets/posts/aspire-three-roll.png)

And we can see these two keys in Redis:

![redis commander keys](/assets/posts/aspire-three-roll-redis.png)

Now with a new more recent key we start the second workflow:

![start worflow 2](/assets/posts/aspire-three-start-2.png)

Now we can signal and finalize both workflows that are currently open:

![workflows open state](/assets/posts/aspire-three-temporal-workflows-list-state.png)

We then have both workflows finished and we can see the full traces in th Aspire Dashboard:

![distributed trace](/assets/posts/aspire-three-distributed-trace.png)

We now we see the elegance of how Temporal designed their platform. In the following example we see for a single workflow instance the payloads for the request and the response are encrypted with two different keys:

![start worflow 2](/assets/posts/aspire-three-two-keys.png)

But now we want to decrypt the payloads in the Temporal UI. For that we need to hook in our codec endpoint, and Temporal offers this per namespace, perfect for multiple teams, or multiple application suites in one team that want namespace isolation. First we need to open the codec server settings (top right corner in the UI), which show this drop in modal, where we enter our API endpoint:

![start worflow 2](/assets/posts/aspire-three-codec-set.png)

When you refresh the page you see the decrypted payload state and you can see the requests over XHR. This is why CORS is important to make sure that only the right URLs can access it over XHR requests.

![start worflow 2](/assets/posts/aspire-three-decrypted.png)

With that the demo is complete. I hope you've enjoyed following along.

### Feedback

If you want to provide feedback then leave a comment, or if you see a typo or error, then add a pull request via the suggest changes!

Full source code [https://github.com/rebeccapowell/aspire-temporal-three](https://github.com/rebeccapowell/aspire-temporal-three)
