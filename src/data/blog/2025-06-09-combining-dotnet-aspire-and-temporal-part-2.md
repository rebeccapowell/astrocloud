---
id: 10001
title: "Combining .NET Aspire with Temporal - Part 2"
pubDatetime: 2025-06-15T16:55:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=10000"
slug: 2025-06-15-combining-dotnet-aspire-and-temporal-part-2
description: Part 2 of a multi-part blog series on Temporal with .NET Aspire.
featured: false
draft: false
categories:
  - work
tags:
  - dotnet
  - aspire
  - temporal
  - docker
---

## Building a Distributed Workflow App with .NET Aspire and Temporal

### Part 2: Deploying a Temporal-based Workflow App with .NET Aspire to Kubernetes

In the [first post](/posts/2025-06-09-combining-dotnet-aspire-and-temporal-part-1/), I showed you how to put together a resilient, distributed workflow-powered example application using [.NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/overview) and [Temporal.io](https://temporal.io/). I covered local development with Aspire's AppHost and containerized services. In this article I'll go more in the direction of deployment with a focus on Kubernetes. In part three of this series I'll move back to the application and focus on payload encryption and codec servers in Temporal to secure your application state from prying eyes. IF this is all new to you then feel free to read [my primer on the evolution of building fault tolerant resilient distributed systems](/posts/2025-06-14-the-five-waves-of-distributed-resilience/).

### Goals

- Understand the Aspire deployment options
- Installing and using the Aspirate CLI tool
- Installing Docker Desktop with Kubernetes support
- Installing Kubernetes CLI tools (kubectl and Kustomize)
- Generating the manfiests
- Deploying the application into a local Kubernetes cluster

---

### Important Notes About Temporal SDK Compatibility

When building .NET applications that use the Temporal .NET SDK in containerized environments, it's critical to ensure compatibility with native dependencies. The Temporal .NET SDK uses native Rust-based binaries under the hood for communication with the Temporal server.

Because of this, **you must disable trimming and AOT publishing**, or the SDK will fail at runtime due to missing symbols or P/Invoke failures.

In your `.csproj` files (for both API and Worker), add the following configuration:

```xml
<PropertyGroup>
  <PublishAot>false</PublishAot>
  <PublishTrimmed>false</PublishTrimmed>
</PropertyGroup>
```

Without this, publishing your app will strip out required metadata and native interop support.

Also note that applications using the Temporal client can not run on alpine. Alpine is not supported by Temporal SDK due to musl/GLIBC incompatibilities.

Therefore you need to make sure you're careful which base image you're using. For example the worker Dockerfile:

```bash
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Worker/Worker.csproj", "Worker/"]
RUN dotnet restore "Worker/Worker.csproj"
COPY . .
WORKDIR "/src/Worker"
RUN dotnet build "Worker.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Worker.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Worker.dll"]
```

---

### Installation Prerequisites

#### 1. Install Docker Desktop

Download Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/).

After installation:

- Open Docker Desktop
- Go to **Settings > Kubernetes**
- Enable Kubernetes
- Apply changes and wait until it says "Kubernetes is running"

> Note that you may prefer [Rancher Desktop](https://rancherdesktop.io/) but since I have a Docker Business license in work and Docker Desktop has a free license for hobby development (like this article series), I'll stick with it because it is familiar.

#### 2. Install Chocolatey (if not already installed)

Open an elevated PowerShell window and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force;
iwr https://community.chocolatey.org/install.ps1 -UseBasicParsing | iex
```

#### 3. Install Required CLI Tools

```powershell
dotnet tool install -g aspirate
choco install kustomize
choco install kubernetes-cli -y
```

Verify the tools are installed:

```bash
aspirate --version
kubectl version --client
kustomize version
```

Since it's always useful to know what version someone was running when they wrote their tutorial:

```bash
PS C:\Users\rebec\RiderProjects\TemporalAspireDemo\AppHost> aspirate --version

     _                    _           ___
    / \     ___   _ __   (_)  _ __   ( _ )
   / _ \   / __| | '_ \  | | | '__|  / _ \
  / ___ \  \__ \ | |_) | | | | |    | (_) |
 /_/   \_\ |___/ | .__/  |_| |_|     \___/
                 |_|
Handle deployments of a .NET Aspire AppHost

9.1.0+c2905d2ab854aaac7f86f3d63da3b93950e76630
PS C:\Users\rebec\RiderProjects\TemporalAspireDemo\AppHost> kubectl version --client
Client Version: v1.32.2
Kustomize Version: v5.5.0
PS C:\Users\rebec\RiderProjects\TemporalAspireDemo\AppHost> kustomize version
v5.5.0
PS C:\Users\rebec\RiderProjects\TemporalAspireDemo\AppHost>
```

#### 4. Setup your own Docker Registry

It isn't absolutely necessary to use Docker Hub Registry / Azure Conatiner Registry for local development work, so you can install your own for local use. Simply run the following container:

```bash
docker run -d -p 5001:5000 --restart always --name registry registry:2
```

> Note: It isn't critical to run your own registry. Just make sure that any `imagePullPolicy` in your k8s manifests are set to `never`.

---

### Project Structure (with our k8s manifests)

```text
TemporalAspireDemo/
├── AppHost/                # Aspire app host
├── Api/                   # Minimal API to trigger workflows
├── Worker/                # Executes workflows and activities
├── Workflows/             # Reusable workflow/activity definitions
├── ServiceDefaults/       # Shared OpenTelemetry config
├── .k8s/                  # Aspirate-generated K8s manifests
```

### Aspire Deployment Options

.NET Aspire supports a few different deployment targets. For most local setups, you'll use one of these:

1. **AppHost (local orchestration)** – Ideal for fast, iterative development. Runs your containerized services with local orchestration.
2. **Docker Compose (via Aspirate)** – Suitable for development scenarios that require multiple services but not full Kubernetes complexity (pre-release).
3. **Kubernetes via Kustomize (generated by Aspirate) or Helm (manual)** – Suitable for more production-like local environments and CI/CD.
4. **Azure Container Apps (via Aspire.Azure)** – Useful for cloud-native deployment without managing Kubernetes directly (basically Bicep as I understand it - I've always been a bit meh about Bicep).

---

### Producing the Aspire manifest

```bash
dotnet run --project TemporalAspireDemo.AppHost\TemporalAspireDemo.AppHost.csproj
  --publisher manifest
  --output-path ../aspire-manifest.json
```

This will:

- Build the `.aspire/manifest.json`
- Output it to the output location of your choosing

#### Example Manifest

For more information on understanding the manifest, there is great [documentation](https://learn.microsoft.com/en-us/dotnet/aspire/deployment/manifest-format) available.

```json
{
  "$schema": "https://json.schemastore.org/aspire-8.0.json",
  "resources": {
    "temporal": {
      "type": "container.v0",
      "connectionString": "",
      "image": "temporalio/admin-tools:latest",
      "entrypoint": "temporal",
      "args": [
        "server",
        "start-dev",
        "--port",
        "7233",
        "--http-port",
        "7234",
        "--metrics-port",
        "7235",
        "--ui-port",
        "8233",
        "--ip",
        "0.0.0.0",
        "--log-level",
        "info"
      ],
      "bindings": {
        "server": {
          "scheme": "https",
          "protocol": "tcp",
          "transport": "http2",
          "targetPort": 7233
        },
        "ui": {
          "scheme": "http",
          "protocol": "tcp",
          "transport": "http2",
          "targetPort": 8233
        },
        "metrics": {
          "scheme": "http",
          "protocol": "tcp",
          "transport": "http2",
          "targetPort": 7235
        },
        "http": {
          "scheme": "http",
          "protocol": "tcp",
          "transport": "http2",
          "targetPort": 7234
        }
      }
    },
    "api": {
      "type": "project.v0",
      "path": "../Api/Api.csproj",
      "env": {
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EXCEPTION_LOG_ATTRIBUTES": "true",
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EVENT_LOG_ATTRIBUTES": "true",
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_RETRY": "in_memory",
        "ASPNETCORE_FORWARDEDHEADERS_ENABLED": "true",
        "HTTP_PORTS": "{api.bindings.http.targetPort}",
        "ConnectionStrings__temporal": "{temporal.connectionString}"
      },
      "bindings": {
        "http": {
          "scheme": "http",
          "protocol": "tcp",
          "transport": "http"
        },
        "https": {
          "scheme": "https",
          "protocol": "tcp",
          "transport": "http"
        }
      }
    },
    "worker": {
      "type": "project.v0",
      "path": "../Worker/Worker.csproj",
      "env": {
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EXCEPTION_LOG_ATTRIBUTES": "true",
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_EMIT_EVENT_LOG_ATTRIBUTES": "true",
        "OTEL_DOTNET_EXPERIMENTAL_OTLP_RETRY": "in_memory",
        "ConnectionStrings__temporal": "{temporal.connectionString}"
      }
    }
  }
}
```

---

### Deploying with Docker Compose (Locally or Remotely)

Alternative publishers hit in Aspire 9.2. You'll need to add the NuGet package `Aspire.Hosting.Docker` to the `AppHost` and then add the following line to support [Aspire docker compose deployments](https://devblogs.microsoft.com/dotnet/dotnet-aspire-92-is-now-available-with-new-ways-to-deploy/#publish-to-docker-compose-with-your-first-publisher-integration):

```csharp
builder.AddDockerComposePublisher();
```

For there experiemental publishing features you'll need to install the pre-release CLI:

```bash
dotnet tool install -g aspire.cli --prerelease
```

Not only will the `docker-compose.yaml` be generated, but it also includes an `.env` file (make sure those are excluded from source control with your `.gitignore`)

```bash
aspirate generate compose
```

Then run:

```bash
docker compose up --build
```

Edit `docker-compose.override.yml` for configuration overrides.

#### Deploying to Coolify

[Coolify](https://coolify.io/docs/knowledge-base/docker/compose) supports Docker Compose deployment directly. Export the Compose bundle from Aspirate and configure your Coolify environment to read from it. This is a convenient way to deploy Aspire-based systems without Kubernetes, particularly for demos and staging. See my other article on [deploying .NET applications to Coolify](/posts/2025-03-17-deploying-dotnet-applications-to-coolify/).

---

## Generating Kubernetes Manifests with `aspirate`

Once you’ve defined your Aspire application using the `DistributedApplicationBuilder` in .NET 9, you can generate Kubernetes-ready deployment artifacts using the `aspirate` CLI:

```bash
aspirate init       # generates the aspirate.json file
```

![aspirate init](/assets/posts/aspire-aspirate-init.png)

Moving on we will build all the resources required using `build`:

```bash
aspirate build      # builds all the resource defined in the manifest.json
```

Finally using `generate` to produce our manifests

```bash
aspirate generate   # generates the kubernetes files
```

![aspirate generate 1](/assets/posts/aspire-aspirate-generate-1.png)
![aspirate generate 2](/assets/posts/aspire-aspirate-generate-2.png)
![aspirate generate 3](/assets/posts/aspire-aspirate-generate-3.png)

This produces a structure like the following:

```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── api-deployment.yaml
│   ├── api-service.yaml
│   ├── worker-deployment.yaml
│   ├── temporal-deployment.yaml
│   ├── temporal-service.yaml
│   ├── configmap-api-env.yaml
│   ├── aspire-dashboard.yaml
│   └── ... (other services)
aspire-manifest.json
```

### `k8s/base/`

This folder uses [Kustomize](https://kustomize.io/) to define your app's base Kubernetes deployment:

- `kustomization.yaml`: Entry point that aggregates and organizes the manifests.
- Individual `Deployment` and `Service` YAMLs for each project and resource (e.g. API, worker, Temporal).
- `ConfigMap` definitions for environment variables.
- Optional extras like the Aspire dashboard.

This is **pure Kubernetes YAML with Kustomize overlays**, not Helm.

You can apply this directly with `aspirate apply`, but rather than do this, let's skip this step and look at using `kustomize` and `kubectl` instead. I'll include it for completeness sake:

```bash
aspirate apply      # deploys them (simply) using aspirate
```

Let's take this step by step:

```bash
kustomize build k8s/base | kubectl apply -f -
```

![aspirate generate 3](/assets/posts/aspire-aspirate-kustimze.png)

Or extend it with overlays for specific environments, but I'll skip this for now, since I just have the one:

```
k8s/
├── base/
├── overlays/
│   ├── dev/
│   └── prod/
```

---

### Converting to Helm (Optional)

If desired, you can:

1. Run `helm create temporal-aspire-app` to scaffold a chart
2. Copy contents of `k8s/base/` into `templates/`
3. Parameterize using Helm values:
   ```yaml
   image:
     repository: my-api
     tag: { { .Values.image.tag } }
   ```
4. Replace `kustomize build` with:
   ```bash
   helm template aspire-app ./aspire-app | kubectl apply -f -
   ```

This hybrid approach is useful for integrating Aspire with existing Helm-based GitOps or CI/CD pipelines.

### Deploying to Kubernetes

To deploy your Aspire application to a local Kubernetes cluster such as Docker Desktop or Rancher Desktop in a more granular way than just doing `aspirate apply`, since I want to give people more familiar with` kubectl` / `kustomize` an idea of what that is doing:

1. Build your local images:
   ```
   docker build -f Api/Dockerfile -t temporalaspire/api:latest .
   docker build -f Worker/Dockerfile -t temporalaspire/worker:latest .
   ```
2. Make sure the image names in your deployment YAML match these tags, and choose `imagePullPolicy: Never` is set to prevent Kubernetes from trying to pull from a registry if you've choose not to use a registry and manually deploy (noted above). Or if you are using a registry (local or otherwise) switch to `imagePullPolicy: Always` to pull even if it is present locally, or `IfNotPresent`, which is the default which pulls if the image isn't already on the node.
3. Apply the manifests using Kustomize:
   ```
   kustomize build ./k8s/base | kubectl apply -f -
   ```
4. Monitor deployment status:
   ```
   kubectl get pods
   ```
5. Forward the API service port to your local machine:
   ```
   # port forward the temporal UI
   kubectl port-forward svc/temporal 8233:8233 -n temporaldemo
   # port forward the API
   kubectl port-forward deployment/api 8080:8080 -n temporaldemo
   # port forward the aspire dashboard
   kubectl port-forward svc/aspire-dashboard 18888:18888 -n temporaldemo
   ```
6. Test the workflow trigger endpoint:
   ```
   curl http://localhost:5000/trigger
   ```
7. Check logs for troubleshooting:
   ```
   kubectl logs deployment/api -n temporaldemo
   kubectl logs deployment/worker -n temporaldemo
   ```
8. Updating a rolling out changes
   ```bash
    kubectl rollout restart deployment/worker -n temporaldemo
   ```
9. Drop everything
   ```bash
   # WARNING: USe this carefully!
   kubectl delete all --all -n temporaldemo
   ```

![aspirate docker desktop](/assets/posts/aspire-docker-desktop-k8s-running.png)

---

### Deploying with `Aspire.Azure` to Azure Container Apps (via CI/CD)

The easiest way to do this with CI.CD is using `azd`. Microsoft have a [pretty good walkthrough](https://learn.microsoft.com/en-us/dotnet/aspire/deployment/azure/aca-deployment-github-actions?tabs=windows&pivots=github-actions). I presume it's `bicep` but I haven't investigated it further yet since it's not much of interest as we are a Pulumi based team at work.

---

### Next Steps

You've now explored multiple deployment paths for your Aspire + Temporal app:

- Local k8s deployments (Docker Desktop / Rancher)
- Docker Compose (including Coolify)
- Kubernetes with Kustomize
- Azure Container Apps via CI/CD

In Part 3, we’ll explore how to protect sensitive data by using custom **Temporal codecs** to encrypt payloads in-flight and at rest.

---
