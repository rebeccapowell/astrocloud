---
id: 3038
title: "Auto-generating documentation and SDKs in ASP.NET Web API"
pubDatetime: 2015-09-16T17:00:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=3038"
slug: 2015-09-16-auto-generating-documentation-and-sdks-in-asp-net-web-api
description: Discusses the benefits and methods of auto-generating documentation and SDKs for ASP.NET Web API using tools like Swagger and AutoRest.
categories:
  - work
tags:
  - api
  - "api explorer"
  - asp.net
  - sdk
  - swagger
  - "web api"
---

Whilst I am a big fan of ServiceStack for building REST APIs, it switched last year from a free open-source tool to a licensed business model. For small open source projects without a commercial backer, it means that we have to take a second look at ASP.NET Web API, Microsoft's own offering.

> If you are developing commercial REST APIs then please check out [ServiceStack](https://servicestack.net/) and the hard work Demis Bellot is putting in to the project. He makes awesome products and [takes care of his customers](https://plus.google.com/u/0/112436682263523181833/posts/PQ7o6XF3LkW).

The benefit of Web API is of course that there are more tools, and extensions being developed by third party developers. There are several challenges in developing APIs that third parties will consume. The two key elements outside the usual development tasks, is the documentation of those APIs, including an API "Explorer" which allows developers to test out the APIs from a sandbox application.

The second major task you have to complete is the provision of SDKs in different languages. For most developers this is a tall task. They struggle to provide SDKs in any other language than the one they are used to working in. Thus, APIs built in Java are unlikely to have a Ruby SDK available.

## API Explorer's using Swagger

Swagger is an awesome and increasingly standard tool for offering developers the ability to try out your API without actually building anything. Using an API explorer they can authenticate using their issued credentials, and then execute REST calls using a web based tool.

Configuring Swagger for ASP.NET Web API just got way easier. Using Swashbuckle you can simply add a Nuget package, apply some configuration and start offering an API explorer in a few minutes. For more information please visit [Swashbuckle](https://github.com/domaindrivendev/Swashbuckle).

## SDKs using AutoRest

Building SDKs in different languages used to be hard, really hard. AutoRest makes it easy. AutoRest uses Swagger extensions to "read" your API definitions and then builds SDKs automatically from those definitions. The following languages/platforms are currently supported:

1. .NET
2. Mono
3. Node.js
4. Java
5. Ruby

The AutoRest source code and documentation can be found on [GitHub](https://github.com/Azure/autorest).

## Example: Using AutoRest to Create SDKs for .NET and Node.js

### Generating a .NET SDK

1. Install AutoRest:

   ```bash
   npm install -g autorest
   ```

2. Generate the .NET SDK:

   ```bash
   autorest --input-file=swagger.json --csharp --output-folder=./GeneratedSDKs/NetSdk
   ```

3. Use the generated .NET SDK:

   ```csharp
   using System;
   using GeneratedSDKs.NetSdk;

   class Program
   {
       static void Main(string[] args)
       {
           var client = new MyApiClient(new Uri("https://api.example.com"));
           var result = client.GetSomeDataAsync().Result;
           Console.WriteLine(result);
       }
   }
   ```

### Generating a Node.js SDK

1. Generate the Node.js SDK:

   ```bash
   autorest --input-file=swagger.json --nodejs --output-folder=./GeneratedSDKs/NodeSdk
   ```

2. Use the generated Node.js SDK:

   ```javascript
   const { MyApiClient } = require("./GeneratedSDKs/NodeSdk");

   const client = new MyApiClient("https://api.example.com");
   client
     .getSomeData()
     .then(result => {
       console.log(result);
     })
     .catch(err => {
       console.error(err);
     });
   ```

By following these steps, you can easily generate SDKs for .NET and Node.js using AutoRest and integrate them into your applications to interact with your ASP.NET Web API.
