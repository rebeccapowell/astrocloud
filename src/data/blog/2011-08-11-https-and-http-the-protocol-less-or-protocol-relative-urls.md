---
id: 768
title: 'HTTPS and HTTP the protocol-less or protocol relative URLs'
pubDatetime: 2011-08-11T10:39:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=768'
slug: 2011-08-11-https-and-http-the-protocol-less-or-protocol-relative-urls
description: An overview of using protocol-relative URLs to load external content over HTTPS or HTTP based on the protocol of the page, avoiding mixed content errors and reducing overhead.
categories:
    - work
tags:
    - http
    - https
    - includes
    - protocol-less
    - script
---

If you are offering HTTPS, then any content you load from external sources also needs to be loaded over HTTPS as well, otherwise you’ll receive errors such as “Only secure content is displayed” and that external CSS, image or JavaScript file will be blocked unless you allow it on each page load. This is often the case with CDN content such as Google’s jQuery CDN and jQueryUI (and the CSS).

Previously, the only way around this would be to hard code the HTTPS, which forces the HTTPS connection when the site is accessed in HTTP mode as well. This is an estimated 3.5% overhead over HTTP, per call. We could use JavaScript to use the appropriate protocol, and the Google Analytics plugin uses this exact technique.

However, there is another way and I had not seen this before until today. It is called protocol-less URLs, and it looks like this:

```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.3.1/jquery.min.js" type="text/javascript"></script>
```

This means that the browser works out which protocol it should be using based on the page that loaded it.

It really works nicely, and more info can be seen here:

1. [http://www.stevesouders.com/blog/2010/02/10/5a-missing-schema-double-download/](http://www.stevesouders.com/blog/2010/02/10/5a-missing-schema-double-download/)
2. [http://blog.httpwatch.com/2010/02/10/using-protocol-relative-urls-to-switch-between-http-and-https/](http://blog.httpwatch.com/2010/02/10/using-protocol-relative-urls-to-switch-between-http-and-https/)
3. [http://stackoverflow.com/questions/4831741/can-i-change-all-my-http-links-to-just](http://stackoverflow.com/questions/4831741/can-i-change-all-my-http-links-to-just)