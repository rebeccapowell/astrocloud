---
id: 2717
title: "Text to UML Diagrams - Online tools"
pubDatetime: 2013-07-11T13:00:24+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/text-to-uml-diagrams-online-tools/"
slug: 2013-07-11-text-to-uml-diagrams-online-tools
description: An introduction to text-based tools for creating UML diagrams, highlighting SVG-Sequence-Diagram, js-sequence-diagrams, and websequencediagrams.com, with an example of a request-poll-response style architecture.
categories:
  - work
tags:
  - diagram
  - online
  - tools
  - uml
---

I came across two great tools for creating UML diagrams. Traditionally I’ve used Visio, which is cumbersome and awkward to use. You need to click, drag, right-click, left-click, god-knows-click to get anywhere.

The great thing about these two tools is that they are text-based. You use a simple text syntax to create these diagrams. You get automatic visual feedback as you type.

- The first is [SVG-Sequence-Diagram](http://sullerandras.github.io/SVG-Sequence-Diagram/) and was done using AngularJS, outputs SVG files and you can download the output as Postscript files of different sizes (A4 to A0).
- The second is [js-sequence-diagrams](http://bramp.github.io/js-sequence-diagrams/) and can be downloaded as SVG.
- The last is [websequencediagrams.com](http://www.websequencediagrams.com/) which is a more commercial service.

Here is an example I put together (using js-sequence-diagrams) which illustrates a request-poll-response style architecture, which is good for working with CQRS style applications and message buses.

![Example Diagram](http://media.tumblr.com/b8c921613a58497cba2c4bbe81adc04b/tumblr_inline_mprkxbl4pg1qz4rgp.png)
