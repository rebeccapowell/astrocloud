---
id: 1462
title: "A simple lightweight HTTP Request Library"
pubDatetime: 2014-02-01T09:43:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=1462"
slug: 2014-02-01-simple-lightweight-http-request-library
fsb_social_facebook:
  - "0"
description: An introduction to Unirest, a lightweight HTTP request library for .NET, including examples of basic POST requests and an overview of its features.
categories:
  - work
tags:
  - .net
  - client
  - http
  - rest
---

Unirest is a set of lightweight HTTP libraries available in multiple languages. This is a port of the Java library to .NET.

Basic POST request example:

```csharp
HttpResponse<MyClass> jsonResponse = Unirest.post("http://httpbin.org/post")
  .header("accept", "application/json")
  .field("parameter", "value")
  .field("foo", "bar")
  .asJson<MyClass>();
```

Async, file uploads, custom entity bodies and multiple method types (get, post, put, patch, delete) are supported.

via <a href="http://unirest.io/net.html">Unirest for .NET - Simplified, lightweight HTTP Request Library</a>.
