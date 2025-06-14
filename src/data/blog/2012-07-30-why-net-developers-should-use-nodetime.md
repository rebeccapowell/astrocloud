---
id: 155
title: "Why .NET developers should use NodaTime"
pubDatetime: 2012-07-30T14:52:49+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=155"
slug: 2012-07-30-why-net-developers-should-use-nodetime
description: An explanation of the benefits of using NodaTime for date and time handling in .NET applications, highlighting its advantages over the .NET date and time API.
categories:
  - work
tags:
  - .net
  - datetime
  - offsets
  - timezones
  - utc
format: quote
---

> A few times after tweeting about Noda Time, people have asked why they should use Noda Time - they believe that the .NET date and time support is already good enough. Now obviously I haven’t seen their code, but I suspect that pretty much any code base doing any work with dates and times will be clearer using Noda Time - and quite possibly more correct, due to the way that Noda Time forces you into making some decisions which are murky in .NET. This post is about the shortcomings of the .NET date and time API. Obviously I’m biased, and I hope this post isn’t seen as disrespectful to the BCL team - aside from anything else, they work under a different set of constraints regarding COM interop etc.

<cite>http://noda-time.blogspot.de/2011/08/what-wrong-with-datetime-anyway.html</cite>
