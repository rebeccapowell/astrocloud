---

id: 800
title: 'RPX OpenID with ASP.NET Webforms and Membership Providers'
pubDatetime: 2009-02-10T21:15:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=800'
slug: 2009-02-10-rpx-openid-with-asp-net-webforms-and-membership-providers'
description: Exploring the integration of RPX, an OpenID consolidator, with ASP.NET Webforms and Membership Providers. This guide covers implementation steps, handling authentication tokens, and mapping OpenID users to an existing database.
categories:
  - work
tags:
  - asp.net
  - membership
  - openid
  - rpxnow
  - webforms

---

This evening I started playing around with [RPX](https://rpxnow.com/), the OpenID consolidator from [JanRain](http://www.janrain.com/). I hit a few hurdles along the way, and I thought I would share a little of those experiences with others trying out RPX.

My first step was to download the [RXPLib from Google Code](http://code.google.com/p/rpxlib/), which is a full API wrapper for RPX. It gives you all the method calls you'll need to work with the RPX API. It is built using the .NET 3.5 Framework, but it worked fine with my 2.0 web application.

The [example code](https://rpxnow.com/docs#example_code) provided by RPXNow.com in [C#](https://rpxnow.com/examples/Rpx.cs) isn't particularly helpful. It is basically a Windows Console application, which allows you to interact with the API. Note: It requires passing parameters to the application, so if you struggle to figure that out, view the project properties and edit the "Command Line Arguments" before running the application in debug mode.

Step past the console app, log in to RPXNow.com with any OpenID-enabled account, and create a website profile. Then use the template created for you and plug that code straight into your login page of your new website project. Create a callback page to which the authorization token will be returned. Add this URL to the script in the placeholder (e.g. `http://localhost:3456/ReceiveToken.aspx`).

Running the web application, you'll get a simple "Sign In" link, which when clicked, offers a number of OpenID providers to select. You need to select one, which will redirect you to that provider. After agreeing to the provider’s conditions, you log in and are passed back to your token receiving page.

Here is where you implement your tie-in to your Membership Provider. It makes sense to implement a custom Membership Provider and hook the user into that.

### Key Considerations for OpenID Authentication

1. The user won't be using a password to log in.
2. Does the email address provided by the OpenID provider already exist in your database?
3. Does the preferred username passed back also exist?

Since the OpenID user doesn't need a password to log in (although you can offer them one), the `CreateUser` method of your Membership Provider will need a default password. Ideally, generate a random one and email it to them in their welcome email. This allows them to continue logging in with their OpenID or with a username and password.

If the email address already exists in your database (ideally, email addresses would be unique in your provider), you can use the "Mapping" feature of RPX. Mapping initially confused me, as it wasn't well explained on the RPX Now website. Simply put, it allows you to link an existing user in your database to an RPX identity. After authentication in your Token page, you can call the RPX service to map your local `UserId` (CustomerId, AccountId, etc.) to an RPX identity. This way, you can link a single user account to multiple RPX identities.

If the preferred username returned by RPX already exists in your database, you'll need to prompt the user to select an alternative username unless you use email addresses as usernames.

### Final Thoughts

RPX looks great and is simple to implement in a basic format. I've likely just scratched the surface in the few hours I’ve played around with it.

Notably, the basic version of RPX is free but offers a limited subset of features compared to premium accounts. One drawback of the basic version is that users won’t log in directly to your website but will be transferred to `https://youraccount.rpxnow.com`. Given modern concerns about phishing, this redirect may deter users.

Additionally, implementing RPX means relying on a third-party service. While RPX seems stable, there’s always the risk of the service shutting down.

However, I think RPX is a great idea. A single, simple control that offers users multiple OpenID providers in an easy-to-understand format is exactly what OpenID needs right now.

I look forward to building something more concrete with it soon.

### Example Implementation

Here’s a basic example of how to handle an authentication token returned by RPX:

```csharp
protected void Page_Load(object sender, EventArgs e)
{
    string token = Request.Form["token"];
    if (!string.IsNullOrEmpty(token))
    {
        string apiKey = "YOUR_RPX_API_KEY";
        string postData = "apiKey=" + HttpUtility.UrlEncode(apiKey) + "&token=" + HttpUtility.UrlEncode(token);
        WebClient client = new WebClient();
        client.Headers[HttpRequestHeader.ContentType] = "application/x-www-form-urlencoded";
        string response = client.UploadString("https://rpxnow.com/api/v2/auth_info", postData);
        
        // Parse response and extract user details
        dynamic jsonResponse = JsonConvert.DeserializeObject(response);
        if (jsonResponse["stat"] == "ok")
        {
            string identifier = jsonResponse["profile"]["identifier"].ToString();
            string email = jsonResponse["profile"]["email"]?.ToString();
            string displayName = jsonResponse["profile"]["displayName"]?.ToString();
            
            // Implement user handling logic here
        }
    }
}
```

This snippet demonstrates how to retrieve an RPX authentication token, send it to RPX for verification, and extract user details from the response. You can then map these details to your Membership Provider and handle user authentication accordingly.