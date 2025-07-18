---
id: 2723
title: "Common .htaccess Redirects"
pubDatetime: 2014-09-30T06:11:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2723"
slug: 2014-09-30-common-htaccess-redirects
description: A comprehensive guide to common .htaccess redirects, including examples for single pages, entire sites, subfolders, and advanced redirection techniques using mod_rewrite.
categories:
  - work
tags:
  - htaccess
  - rewrite
  - rule
---

I've recently been [redirecting one website content to another](http://stackoverflow.com/questions/4181606/htaccess-301-redirect-path-and-all-child-paths). Here are some useful common .htaccess file redirects.

```bash
#301 Redirects for .htaccess

#Redirect a single page:
Redirect 301 /pagename.php http://www.domain.com/pagename.html

#Redirect an entire site:
Redirect 301 / http://www.domain.com/

#Redirect an entire site to a sub folder
Redirect 301 / http://www.domain.com/subfolder/

#Redirect a sub folder to another site
Redirect 301 /subfolder http://www.domain.com/

#This will redirect any file with the .html extension to use the same filename but use the .php extension instead.
RedirectMatch 301 (.*)\.html$ http://www.domain.com$1.php

##
#You can also perform 301 redirects using rewriting via .htaccess.
##

#Redirect from old domain to new domain
RewriteEngine on
RewriteBase /
RewriteRule (.*) http://www.newdomain.com/$1 [R=301,L]

#Redirect to www location
RewriteEngine on
RewriteBase /
rewritecond %{http_host} ^domain.com [nc]
rewriterule ^(.*)$ http://www.domain.com/$1 [r=301,nc]

#Redirect to www location with subdirectory
RewriteEngine on
RewriteBase /
RewriteCond %{HTTP_HOST} domain.com [NC]
RewriteRule ^(.*)$ http://www.domain.com/directory/index.html [R=301,NC]

#Redirect from old domain to new domain with full path and query string:
Options +FollowSymLinks
RewriteEngine On
RewriteRule ^(.*) http://www.newdomain.com%{REQUEST_URI} [R=302,NC]

#Redirect from old domain with subdirectory to new domain w/o subdirectory including full path and query string:
Options +FollowSymLinks
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/subdirname/(.*)$
RewriteRule ^(.*) http://www.katcode.com/%1 [R=302,NC]

Rewrite and redirect URLs with query parameters (files placed in root directory)

Original URL:

http://www.example.com/index.php?id=1
Desired destination URL:

http://www.example.com/path-to-new-location/
.htaccess syntax:

RewriteEngine on
RewriteCond %{QUERY_STRING} id=1
RewriteRule ^index\.php$ /path-to-new-location/? [L,R=301]
Redirect URLs with query parameters (files placed in subdirectory)

Original URL:

http://www.example.com/sub-dir/index.php?id=1
Desired destination URL:

http://www.example.com/path-to-new-location/
.htaccess syntax:

RewriteEngine on
RewriteCond %{QUERY_STRING} id=1
RewriteRule ^sub-dir/index\.php$ /path-to-new-location/? [L,R=301]
Redirect one clean URL to a new clean URL

Original URL:

http://www.example.com/old-page/
Desired destination URL:
http://www.example.com/new-page/
.htaccess syntax:

RewriteEngine On
RewriteRule ^old-page/?$ $1/new-page$2 [R=301,L]
Rewrite and redirect URLs with query parameter to directory based structure, retaining query string in URL root level

Original URL:

http://www.example.com/index.php?id=100
Desired destination URL:

http://www.example.com/100/
.htaccess syntax:

RewriteEngine On
RewriteRule ^([^/d]+)/?$ index.php?id=$1 [QSA]
Rewrite URLs with query parameter to directory based structure, retaining query string parameter in URL subdirectory

Original URL:
http://www.example.com/index.php?category=fish
Desired destination URL:
http://www.example.com/category/fish/
.htaccess syntax:

RewriteEngine On
RewriteRule ^/?category/([^/d]+)/?$ index.php?category=$1 [L,QSA]
Domain change – redirect all incoming request from old to new domain (retain path)

RewriteEngine on
RewriteCond %{HTTP_HOST} ^example-old\.com$ [NC]
RewriteRule ^(.*)$ http://www.example-new.com/$1 [R=301,L]
If you do not want to pass the path in the request to the new domain, change the last row to:

RewriteRule ^(.*)$ http://www.example-new.com/ [R=301,L]

#From blog.oldsite.com -> www.somewhere.com/blog/
retains path and query, and eliminates xtra blog path if domain is blog.oldsite.com/blog/
Options +FollowSymLinks
RewriteEngine On
RewriteCond %{REQUEST_URI}/ blog
RewriteRule ^(.*) http://www.somewhere.com/%{REQUEST_URI} [R=302,NC]
RewriteRule ^(.*) http://www.somewhere.com/blog/%{REQUEST_URI} [R=302,NC]
```

Source: https://gist.github.com/ScottPhillips/1721489
