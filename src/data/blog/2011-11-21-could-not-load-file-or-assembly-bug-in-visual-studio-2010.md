---
id: 761
title: "Could not load file or assembly bug in Visual Studio 2010"
pubDatetime: 2011-11-21T14:48:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=761"
slug: 2011-11-21-could-not-load-file-or-assembly-bug-in-visual-studio-2010
description: An overview of a bug in Visual Studio 2010 where the Copy Local setting on a referenced DLL is not honored, and a solution to fix the issue.
categories:
  - work
tags:
  - asp.net
  - bug
  - "visual studio"
format: quote
---

Update: The [answer I made on this topic back for VS2010](https://stackoverflow.com/a/8213977/119624), has continued through the subsequent versions 2012, 2013, 2015, 2017, 2019 and now 2022.

Visual Studio 2010 does not honor the **Copy Local** setting on a referenced DLL **unless you set it to false and then back to true**.

By default the XML looks like this:

```xml
<Reference Include="DevExpress.SpellChecker.v11.1.Core">
  <HintPath>..\References\DevExpress.SpellChecker.v11.1.Core.dll</HintPath>
</Reference>
```

Following the simple step above sets it correctly, which is then honored by MsBuild and the DLL we be included in the deployment:

```xml
<Reference Include="DevExpress.SpellChecker.v11.1.Core">
  <HintPath>..\References\DevExpress.SpellChecker.v11.1.Core.dll</HintPath>
  <Private>True</Private>
</Reference>
```

A nasty bug. By default the Copy Local should be set to False in the properties window, since the build treats it as such.

To reiterate: To fix, change the **Copy Local** property to **False** then _save_ your project. Then revert to **True** and _save_ the project again.
