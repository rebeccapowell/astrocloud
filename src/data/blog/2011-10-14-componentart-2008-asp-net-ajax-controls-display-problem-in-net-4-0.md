---
id: 765
title: 'ComponentArt 2008 ASP.NET Ajax controls display problem in .NET 4.0'
pubDatetime: 2011-10-14T09:39:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=765'
slug: 2011-10-14-componentart-2008-asp-net-ajax-controls-display-problem-in-net-4-0
description: An overview of a display problem with ComponentArt 2008 ASP.NET Ajax controls in .NET 4.0, and a solution to fix the issue by modifying the web.config file.
categories:
    - work
tags:
    - asp.net
    - 'component art'
    - web.ui
    - webforms
---

We have recently upgraded an ASP.NET web application from .NET 2.0 to .NET 4.0. We have several grids and other controls using the ComponentArt 2008 Web.UI suite. After upgrading we noticed that the grids were not displaying any data and the paging controls were missing. It took a while to find the problem.

The problem lies in [the way that .NET 4.0 controls ClientIDs](http://weblogs.asp.net/scottgu/archive/2010/03/30/cleaner-html-markup-with-asp-net-4-web-forms-client-ids-vs-2010-and-net-4-0-series.aspx). There is much more control over how these ClientIDs are named, and that is a good thing. However, in the case of these controls it mean that the controls could not correctly reference themselves nor sub controls.

The solution can be seen in [this ComponentArt forum post](http://www.componentart.com/community/forums/t/63224.aspx), and works for other versions of the ComponentArt Web.UI as well I believe. The important change comes in the web.config:

```xml
<?xml version="1.0"?>
<configuration>
    <system.web>
        <compilation debug="true" targetFramework="4.0"/>
        <pages controlRenderingCompatibilityVersion="3.5" clientIDMode="AutoID"/>
    </system.web>
</configuration>