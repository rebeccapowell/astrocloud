---
id: 767
title: 'WCF JSON Serialization error with DateTime.MinVal and UTC'
pubDatetime: 2011-09-02T15:51:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=767'
slug: 2011-09-02-wcf-json-serialization-error-with-datetime-minval-and-utc
description: An overview of a WCF JSON serialization error with DateTime.MinVal and UTC, and a solution to fix the issue by specifying the DateTimeKind as UTC.
categories:
    - work
tags:
    - datetime
    - json
    - microsoft
    - minvalue
    - wcf
---

I came across the following error today in a WCF JSON web service:

```bash
SerializationException: DateTime values that are greater than DateTime.MaxValue or smaller than DateTime.MinValue when converted to UTC cannot be serialized to JSON.
```

The solution took me a while to get my head round, so I thought I should share it. The clue was a [StackOverflow post](http://stackoverflow.com/questions/4025851/why-can-datetime-minvalue-not-be-serialized-in-timezones-ahead-of-utc) specifying the error and its cause.

This was compounded by the fact that the WCF service was returning a rather obscure 504 error, namely:

```bash
ReadResponse() failed: The server did not return a response for this request.
```

The error was not being picked up and returned as a service fault, so I switched [WCF tracing on](http://blogs.msdn.com/b/madhuponduru/archive/2006/05/18/601458.aspx). The error message was then visible in the logs:

```bash
System.Runtime.Serialization.SerializationException, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089

DateTime values that are greater than DateTime.MaxValue or smaller than DateTime.MinValue when converted to UTC cannot be serialized to JSON.
```

The bottom line is that if you have a DateTime property that is not set, it will be defaulted to DateTime.MinVal when serialized. However, DateTime.MinVal does not have a DateTimeKind specified, which is the default.

This causes a problem with the serializer because it does not treat the MinVal as UTC. If you are in a timezone + GMT (East), then [this is going to cause you a problem](http://daveonsoftware.blogspot.com/2009/12/json-serialization.html), and you'll get the error above. This is very nicely described by [Adam Robinson](http://programmingit.com/questions/programming/why-can-datetime-minvalue-not-be-serialized-in-timezones-ahead-of-utc/):

If your time zone is GMT+1, then the UTC value of DateTime.MinValue in your time zone is going to be an hour less than DateTime.MinValue.

In my case I had a bunch of DTO objects being passed back as JSON. The serializer would hit the defaulted DateTime value and error. the solution was simple:

```c#
foreach (var dto in dtos)
{
    dto.DateStart = DateTime.SpecifyKind(dto.DateStart, DateTimeKind.Utc);
}
```

The alternative is to stop DateTimes being left empty. In my case an [Automapper](http://www.google.com/url?sa=t&source=web&cd=1&ved=0CCEQFjAA&url=http%3A%2F%2Fautomapper.codeplex.com%2F&ei=jfhgTtirNdCa-wae7dgn&usg=AFQjCNGyIWUT6oA61LmaeE1Dy5_P6ZnGpw&sig2=exkFomGQtKOq_f0jvrliwA) misconfiguration on the developer's part. If you have the potential for empty DateTime properties, then maybe consider making them nullable.