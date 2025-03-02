---
id: 802
title: 'C# vs VB.NET - My choice and why'
pubDatetime: 2004-01-24T16:08:56+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=802'
slug: 2004-01-24-csharp-vs-vb.net-my-choice-and-why
description: A comparison of C# and VB.NET, highlighting the reasons for choosing C# over VB.NET, including its certification, powerful features, less verbose syntax, and XML code documentation.
categories:
    - work
tags:
    - asp.net
    - vb.net
    - c#
---

I have been asked today by a client "why C# over VB.NET". I already had previously looked at this dilemma, and had to make a decision either way, but today I needed to provide valid reasons. The answer is C#!!

So why is this such an easy decision? It's really based on just a few simple, but powerful points.

## C# is ISO and ECMA certified

This is probably the strongest reason why we feel C# is a better choice than VB.NET. When you work with a language that has been recognized and adopted by international standards bodies you can be sure that its syntax and language are recognized throughout the industry as an open standard, and that changes to the language won't just be done simply because they can, but that they will be discussed and implemented to benefit the community as a whole (e.g. XML, HTML), and not just a subset of users. At the same time, being ISO and ECMA standards allows C# to be used in a wider variety of organizations and companies because of the certifications.

## C# is a more powerful language

Most developers regardless of using VB.NET or C# will tell you that C# is more powerful with features (just to name a few) like unsafe code, operator overloading, better memory management via the `using` statement, XML code documentation (even though you can argue it was just omitted from VB.NET and the compilation process, the fact remains that XML comments are not supported in VB.NET code "out of the box"), and coming 2.0 features like Generics. While some VB.NET users will argue that these features aren't needed in most applications, it still doesn't take the fact away that they aren't present in VB.NET. Just because you may not need to use that X-ray vision doesn't mean you shouldn't have the ability to use it when you want to.

### Example: Using Statement in C#

```csharp
using (var stream = new FileStream("file.txt", FileMode.Open))
{
    // Use the stream
}
// The stream is automatically disposed of here
```