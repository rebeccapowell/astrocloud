---
id: 322
title: "Never rewrite code from scratch"
pubDatetime: 2012-04-06T11:25:18+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=322"
slug: 2012-04-06-never-rewrite-code-from-scratch
description: An explanation of why rewriting code from scratch is a strategic mistake, and the benefits of using the Strangler Pattern for refactoring and improving existing codebases.
categories:
  - work
tags:
  - coding
  - tips
format: quote
---

> They did it by making the single worst strategic mistake that any software company can make: They decided to rewrite the code from scratch.

<cite>http://www.joelonsoftware.com/articles/fog0000000069.html</cite>

## Why Rewriting Code from Scratch is a Mistake

Rewriting code from scratch can seem like an attractive option, especially when dealing with a legacy codebase that has become difficult to maintain. However, this approach comes with significant risks and drawbacks:

1. **Loss of Functionality**: The existing codebase has likely evolved over time to include numerous features and bug fixes. Rewriting from scratch risks losing this accumulated knowledge and functionality.
2. **Time and Cost**: Rewriting a codebase from scratch is a time-consuming and costly process. It diverts resources away from adding new features and improving the existing system.
3. **Introduction of New Bugs**: A complete rewrite is likely to introduce new bugs and issues that were not present in the original codebase.
4. **Disruption to Users**: Rewriting the codebase can lead to disruptions for users, as the new system may not be as stable or reliable as the existing one.

## The Strangler Pattern

Instead of rewriting code from scratch, consider using the Strangler Pattern. This approach allows you to incrementally refactor and improve the existing codebase without the risks associated with a complete rewrite.

### How the Strangler Pattern Works

The Strangler Pattern involves gradually replacing parts of the legacy system with new functionality. This is done in a series of small, manageable steps, allowing you to maintain the stability of the existing system while making improvements.

1. **Identify a Small Part of the System**: Start by identifying a small, self-contained part of the system that can be refactored or replaced.
2. **Build the New Functionality**: Develop the new functionality alongside the existing system. Ensure that it can coexist with the legacy code.
3. **Redirect Traffic**: Gradually redirect traffic from the old functionality to the new one. Monitor the performance and stability of the new system.
4. **Remove the Old Code**: Once the new functionality has been thoroughly tested and proven to be stable, remove the old code.

### Benefits of the Strangler Pattern

- **Reduced Risk**: By making incremental changes, you reduce the risk of introducing new bugs and issues.
- **Continuous Improvement**: The Strangler Pattern allows you to continuously improve the system without the need for a complete rewrite.
- **Minimized Disruption**: Users experience minimal disruption, as the system remains stable and functional throughout the refactoring process.
- **Preservation of Knowledge**: The existing codebase contains valuable knowledge and functionality that is preserved and built upon, rather than discarded.

By using the Strangler Pattern, you can effectively refactor and improve your codebase without the risks and drawbacks associated with rewriting code from scratch.

<cite>http://www.joelonsoftware.com/articles/fog0000000069.html</cite>
