---
id: 766
title: "Schema Compare in the Visual Studio Database Project sucks"
pubDatetime: 2011-09-08T12:31:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=766"
slug: 2011-09-08-schema-compare-in-the-visual-studio-database-project-sucks
description: An overview of the frustrations with the Schema Compare feature in Visual Studio 2010's Database Project, and suggestions for improving the tool.
categories:
  - work
tags:
  - "database project"
  - microsoft
  - "schema compare"
  - "visual studio"
---

Visual Studio 2010 has a very cool Database Project type, which is not supported by all [Visual Studio editions](http://www.microsoft.com/visualstudio/en-us/products), but it is certainly included in Ultimate and Premium. One of the features is a [Schema Compare](http://msdn.microsoft.com/en-us/library/aa833435.aspx), which allows you to compare two database schemas against each other, shows you the differences and then allows you to update the target schema from the source. Those two schemas could be held in actual databases, or in the database project itself. This means that you can compare an existing installation and generate a schema difference script to upgrade one installation to match the other - in other words, great for doing deployment upgrades!

The end result of the Schema Compare is awesome. However, the tool for setting up the schema compare sucks. It works, but it sucks so badly, it makes me want to scream every time I use it.

Every time you open the schema compare (even if you saved it), it conveniently "forgets" the options you have previously set. It also makes the options **exclusive** rather than **inclusive**. There are about 30 different options, which means that you have to run through excluding the common things that you don't want to compare (e.g. database users, roles, credential, files) every damn time.

![Not again. Please Microsoft. Don't make choose these again!](/assets/posts/arrrrrrgh.png)

Let's start by making the list inclusive. Then pre-select the common things people are going to want to compare. If you take a wild guess at it, that would probably be:

1. Tables
2. Stored Procedures
3. Indexes
4. Unique Keys
5. Views

Pretty please with sugar on top, Microsoft. Sort this one out for the next release.
