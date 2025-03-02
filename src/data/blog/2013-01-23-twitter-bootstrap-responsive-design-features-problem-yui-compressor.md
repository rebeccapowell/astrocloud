---
id: 752
title: 'Twitter Bootstrap responsive design features problem YUI Compressor'
pubDatetime: 2013-01-23T15:53:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=752'
slug: 2013-01-23-twitter-bootstrap-responsive-design-features-problem-yui-compressor
description: An overview of an issue with Twitter Bootstrap responsive design classes when using YUI Compressor, and a solution to fix the problem.
categories:
    - work
tags:
    - boostrap
    - bug
    - css
    - responsive
    - twitter
    - 'yui compressor'
---

I recently had a problem with a website built on Twitter Bootstrap. I was using the `.visible-desktop`, `.hidden-phone`, etc [responsive classes](http://twitter.github.com/bootstrap/scaffolding.html#responsive), and they just wouldn't work. The `.visible-desktop` would not appear on a desktop! When I used the uncompressed versions of the CSS files everything worked ok, and it was only when I compressed and minified them that the problems started.

The solution was relatively easy, once I'd figured out why. I was using YUI Compressor to minimize and combine the various CSS files into one.

The combining was not an issue, but the media queries were getting changed from:

Before

```css
@media only screen and (-webkit-min-device-pixel-ratio: 1.5)
```

After

```css
@media only screen and(-webkit-min-device-pixel-ratio: 1.5){}
```

Fix

```css
@media (min-width: 768px) and /*!YUI-Compressor */ (max-width: 979px)
```