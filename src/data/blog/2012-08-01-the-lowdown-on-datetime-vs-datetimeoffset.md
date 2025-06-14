---
id: 150
title: "The lowdown on DateTime vs DateTimeOffset"
pubDatetime: 2012-08-01T14:52:01+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=150"
slug: 2012-08-01-the-lowdown-on-datetime-vs-datetimeoffset
description: An explanation of the differences between DateTime and DateTimeOffset in .NET, highlighting the advantages of using DateTimeOffset for timezone-aware date and time handling.
categories:
  - work
tags:
  - .net
  - datetime
  - offset
  - timezones
format: quote
---

> In .Net 3.5 an entirely new date/time field was added called DateTimeOffset. This data extends the DateTime to add in the concept of a timezone offset. It is still a struct, so you need to use System.Nullable if you want to be able to have a null value. A DateTimeOffset value is not tied to a particular time zone, but can originate from any of a variety of time zones. For example, there are can multiple timezones that represent the same offset such as UTC –6:00 which can be Central Time, Central American, Saskatchewan, or Guadalajara. So you don’t know the timezone that the datetime represents, but you do know the offset. This is all you need to perform comparisons to other DateTimeOffsets.

<cite>http://www.danrigsby.com/blog/index.php/2008/08/23/datetime-vs-datetimeoffset-in-net/</cite>
