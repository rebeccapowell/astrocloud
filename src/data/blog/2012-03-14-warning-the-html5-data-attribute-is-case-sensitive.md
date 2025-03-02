---
id: 759
title: 'Warning: The HTML5 Data Attribute is case sensitive'
pubDatetime: 2012-03-14T09:33:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=759'
slug: 2012-03-14-warning-the-html5-data-attribute-is-case-sensitive
description: An explanation of why the HTML5 data attribute is case-sensitive, highlighting a specific issue with uppercase letters and providing a solution based on the HTML5 specification.
categories:
    - work
tags:
    - 'case sensitive'
    - 'data attribute'
    - html5
---

I came across a nice little problem today. I wanted to use the HTML5 data attribute with jQuery. You can add any kind of data as attributes to any DOM element, using the prefix `data-`.

You can then use that data client side using JavaScript, which is handy for lots of different situations. Today I could not get this to work. My attribute was named so:

```javascript
data-projectUrl
```

**After a lot of frustration, the issue was resolved as caused by the upper case U in Url. The specification does not allow this, unless it follows a hyphen.**

From the [HTML5 specification](http://www.w3.org/TR/html5/elements.html#embedding-custom-non-visible-data-with-the-data-attributes) you will see the following:

1. For each content attribute on the element whose first five characters are the string "data-" and whose remaining characters (if any) do not include any characters in the range U+0041 to U+005A (LATIN CAPITAL LETTER A to LATIN CAPITAL LETTER Z), add a name-value pair to list whose name is the attribute's name with the first five characters removed and whose value is the attribute's value.

2. For each name on the list, for each U+002D HYPHEN-MINUS character (-) in the name that is followed by a character in the range U+0061 to U+007A (U+0061 LATIN SMALL LETTER A to U+007A LATIN SMALL LETTER Z), remove the U+002D HYPHEN-MINUS character (-) and replace the character that followed it by the same character converted to ASCII uppercase.

Here is an example:

<iframe style="height: 300px; width: 100%;" src="https://jsfiddle.net/junto/nBCwU/embedded/" frameborder="0" allowfullscreen="allowfullscreen"></iframe>