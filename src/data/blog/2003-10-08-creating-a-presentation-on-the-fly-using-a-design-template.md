---
id: 802
title: 'Creating a PowerPoint presentation on-the-fly using a design template'
pubDatetime: 2003-10-08T17:22:52+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=802'
slug: 2003-10-08-creating-a-presentation-on-the-fly-using-a-design-template
description: A guide on how to automate the creation of PowerPoint presentations using ASP (classic), including using a design template, updating the title, copying slides, and saving the presentation to the server.
categories:
    - work
tags:
    - asp
    - powerpoint
    - create
---

Automating PowerPoint is not pretty, nor is it clever! Microsoft Office applications were not designed to be used as automation objects, but with a bit of persistence - they can be. Why would you want to do this though? Who would need to generate out PowerPoint files on the fly?

Who knows, but as an example an application could be designed to allow salespeople to select from a master template to select case studies that apply to their upcoming presentation. Or maybe you want to let people create basic PowerPoint presentations to a design template (.POT file) you want to confine them to that. So now we have a reason, how do you go about doing this?

First some warnings. There are almost no examples of how to achieve PowerPoint automation on the internet. Believe me - I've looked high and low because I had a client that wanted to do this, and the information I am providing here is the result of the research. Microsoft makes it very clear that they do not support Office automation, and do not advise it. I agree with their main points on this. Office applications are designed to run within an interactive desktop environment, assume a user profile and do not have the required security principles behind them. In fact, Microsoft says this:

> "Microsoft does not currently recommend, and does not support, Automation of Microsoft Office applications from any unattended, non-interactive client application or component (including ASP, DCOM, and NT Services), because Office may exhibit unstable behavior and/or deadlock when run in this environment."

So with all this doom and gloom do we still want to have a crack at this? Hell yeah!! I'm going to do this with ASP (classic).

Microsoft is kind enough to provide a full breakdown of the PowerPoint object interface under the basis of a VBA programmer's guide and provide some considerations to think about before attempting what we are about to do too. The full PowerPoint object model is available for programmers here. Armed with this we can start to think about what we are going to do and how we are going to achieve this.

For this task, I'm not going to create a PPT from blank, but use a design template. This makes life a little easier, and I assume that most people will prefer to do this that way. I'm then going to update the presentation title, and then finally copy a selection of slides from a master presentation to the new one before saving it to the server.

```vb
Set ppt = CreateObject("PowerPoint.Application")
ppt.visible = true

tempName = Hour(Now) & minute(now) & second(now) & ".ppt"
tempPath = Server.MapPath("store") & "\" & tempName

'ppt.Presentations.Add -1 ' only use to create one from fresh
potName = "Technology.pot"
ppt.Presentations.Open Server.MapPath("templates") & "\" & potName,true,true,true ' only use with a design template
ppt.ActiveWindow.View.GotoSlide ppt.ActivePresentation.Slides.Add(1, 11).SlideIndex
```

The PowerPoint Presentation is now created and active. The last line adds, and takes us to the first slide. Accessing areas within a slide is done through the use of a selection of an area. Hence the next step selects the title area of the first slide and sets the text.

```vb
ppt.ActiveWindow.Selection.SlideRange.Shapes.Title.Select
With ppt.ActiveWindow.Selection.TextRange
   .Text = "Copyright © Junto.co.uk 2003"
   With .Font
     .Name = "Verdana"
     .Size = 20
     .Bold = 0
     .Italic = 0
     .Underline = 0
     .BaselineOffset = 0
     .AutoRotateNumbers = 0
     .Color.SchemeColor = 2 
   End With
End With
ppt.ActiveWindow.Selection.Unselect
```

The next step is to access the master presentation and copy slides from this to the new presentation. The following demonstrates this and you'll need to change the "intFrom" and "intTo" to the actual slide numbers as a range:

```vb
ppt.ActiveWindow.View.GotoSlide
ppt.ActivePresentation.Slides.InsertFromFile(Server.MapPath("master.ppt"),1,intFrom,intTo)

ppt.ActivePresentation.SaveAs tempPath
ppt.ActivePresentation.Close

' there is no Application object for PPT, so just quit ppt
ppt.Quit
' Release the memory to PPT
set ppt = Nothing
```

The next step is to download the new presentation we've created on-the-fly. Personally I prefer to force the download via a stream binary-write, but you could just link to the saved file. I'll release the download code another time.

There is no code package for download available for example at present. Mainly because you need to set this up yourself on your server and the help I've given should give you a good start. Remember that Microsoft Office (including PowerPoint) needs to be installed on your server!!

N.B. I have been using Office 2000 edition for this example.