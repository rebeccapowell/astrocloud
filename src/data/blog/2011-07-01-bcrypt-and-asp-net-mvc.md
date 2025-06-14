---
id: 583
title: "BCrypt and ASP.net MVC"
pubDatetime: 2011-07-01T08:27:06+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=583"
slug: 2011-07-01-bcrypt-and-asp-net-mvc
description: An overview of using BCrypt for password hashing in ASP.NET MVC applications, highlighting its advantages for secure password storage.
categories:
  - work
tags:
  - asp.net
  - bcrypt
  - mvc
  - security
format: quote
---

> I was just reading today about yet another site that stored their user’s passwords in plain text. Of course the issue is if you get hacked you expose everyone’s passwords to the world, passwords they might be using on other sites, etc.

There is a lot of debate of how you should go about encrypting/hashing/obscuring passwords and with a little research I found a lot of people seem to think BCrypt is the way to go.

The recent [hack of MtGox](https://mtgox.com/press_release_20110630.html), the now infamous Bitcoin exchange, illustrates (yet again) that companies are storing cleartext passwords. A great [HackerNews discussion](http://news.ycombinator.com/item?id=2716597) dragged me into the murky world of [password hashing](http://en.wikipedia.org/wiki/Password_hashing); the result being the article quoted and linked to above.

My interest is in the technology stack I’m familiar with, namely [WISC](http://stackoverflow.com/questions/177901/what-does-wisc-stack-mean). The problem is that Microsoft don’t offer the [bcrypt](http://en.wikipedia.org/wiki/Bcrypt) solution as a [potential password hashing scheme under ASP.NET](http://stackoverflow.com/questions/1137368/what-is-default-hash-algorithm-that-asp-net-membership-uses/1137449#1137449). ASP.NET Membership uses SHA1 by default (and [HMACSHA256 in .NET 4.0 Framework](http://stackoverflow.com/questions/1137368/what-is-default-hash-algorithm-that-asp-net-membership-uses/4227642#4227642)), but the more I [read](http://codahale.com/how-to-safely-store-a-password/) [about](http://chargen.matasano.com/chargen/2007/9/7/enough-with-the-rainbow-tables-what-you-need-to-know-about-s.html) [this](http://news.ycombinator.com/item?id=2004962), I come to the conclusion that such hashing algorithms just aren’t good enough.

Password hashing done properly (i.e. not the standard ASP.NET Membership scheme) uses bcrypt, because it is slow, and introduces a work factor, namely, a trade-off of security versus speed. As hardware gets faster and cloud computing becomes the norm, it becomes very cheap to crack hashing algorithms that are **designed to be fast**.

The [quoted article](http://www.giantflyingsaucer.com/blog/?p=2189) outlines how you can use open source [bcrypt in ASP.NET](http://stackoverflow.com/questions/5643187/net-implementation-of-bcrypt-which-implements-hashalgorithm) and if you want to understand more about custom hashing algorithms in .NET you should take a look in [HashAlgorithm](http://stackoverflow.com/questions/6460711/adding-a-custom-hashalgorithmtype-in-c-asp-net).
