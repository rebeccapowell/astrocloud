---
id: 2815
title: 'JavaScript Module Pattern'
pubDatetime: 2015-02-02T17:05:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=2815'
slug: 2015-02-02-javascript-module-pattern
description: An overview of the JavaScript module design pattern, highlighting its benefits for code organization and readability, with resources for further learning.
categories:
    - work
tags:
    - concepts
    - 'design patterns'
    - javascript
    - module
---

The JavaScript module is a great design pattern for JavaScript coders. It makes code simple to read and easy to use. It allows you to hide private methods inside your module and expose public properties that you want to expose when you use the Revealing Module Pattern. More importantly, you can say bye bye to prototype bloat hell.

Here are a number of useful resources and links for building JavaScript modules:

1. [How Do You Structure JavaScript? The Module Pattern Edition](http://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/)
2. [JavaScript module pattern with example](http://stackoverflow.com/questions/17776940/javascript-module-pattern-with-example)
3. [Mastering the Module Pattern](http://toddmotto.com/mastering-the-module-pattern/)

## Example: JavaScript Module Pattern

Here is an example of the JavaScript Module Pattern using the Revealing Module Pattern:

```javascript
var MyModule = (function() {
    // Private variables and functions
    var privateVar = 'I am private';
    var privateFunction = function() {
        console.log(privateVar);
    };

    // Public variables and functions
    var publicVar = 'I am public';
    var publicFunction = function() {
        console.log(publicVar);
    };

    // Reveal public pointers to private functions and properties
    return {
        publicVar: publicVar,
        publicFunction: publicFunction
    };
})();

// Usage
MyModule.publicFunction(); // Outputs: I am public
console.log(MyModule.publicVar); // Outputs: I am public