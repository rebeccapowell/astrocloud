---
id: 2332
title: 'Fix Internet Explorer prompts to save JSON response when uploading files'
pubDatetime: 2014-02-13T13:08:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=2332'
slug: 2014-02-13-fix-internet-explorer-prompts-save-json-response-uploading-files
description: A guide to fixing the issue where Internet Explorer prompts to save JSON responses when uploading files via AJAX, including a solution for modifying HTTP headers in ASP.NET MVC.
categories:
    - work
tags:
    - bug
    - 'internet explorer'
    - json
    - problem
---

<!-- wp:paragraph -->
<p>When you upload a file using AJAX and then reply using a JSON response, Internet Explorer decides to interpret the response as something to download to disk or open. In essence, it interjects in between the Ajax post response and turns the response into a standard IE file download.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>To resolve this I looked at the HTTP headers from two posts made by IE. The first is the post with a file:</p>
<!-- /wp:paragraph -->

<!-- wp:code {"backgroundColor":"black"} -->
```bash
POST http://localhost:9999/customer/ HTTP/1.1
Accept: text/html, application/xhtml+xml, */*
Content-Type: multipart/form-data; boundary=---------------------------7de3581a151560
.......removed irrelevant lines.......
```
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>The response to this looks like this:</p>
<!-- /wp:paragraph -->

<!-- wp:code {"backgroundColor":"black"} -->
```bash
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
.......removed irrelevant lines.......

{"customerId":1003}
```
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>And then the second without a file, using a standard Ajax post:</p>
<!-- /wp:paragraph -->

<!-- wp:code {"backgroundColor":"black"} -->
```bash
POST http://localhost:9999/customer/edit/1003 HTTP/1.1
Accept: application/json, text/javascript, */*; q=0.01
Content-Type: application/x-www-form-urlencoded
.......removed irrelevant lines.......
```
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>With the resulting response:</p>
<!-- /wp:paragraph -->

<!-- wp:code {"backgroundColor":"black"} -->
```bash
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
.......removed irrelevant lines.......

{"Success":true}
```
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>In order to fix the problem I needed to change the content type of the response. Internet Explorer isn't accepting application/json, and that is what ASP.NET MVC is sending back by default. A quick fix is to override the JsonResult in the base controller:</p>
<!-- /wp:paragraph -->

<!-- wp:code {"backgroundColor":"black"} -->
```c#
protected new JsonResult Json(object data) {
    if (this.Request.AcceptTypes == null) {
        return base.Json(data);
    }

    return this.Request.AcceptTypes
        .Any(x => x.Equals("application/json", StringComparison.OrdinalIgnoreCase)) ?
        base.Json(data) : base.Json(data, "text/plain");
}
```
<!-- /wp:code -->

<!-- wp:paragraph -->
<p>We now get text/plain back for browsers (IE) that aren't ready to accept application/json. Problem solved.</p>
<!-- /wp:paragraph -->