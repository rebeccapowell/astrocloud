---
id: 785
title: 'ASP.NET MVC Simple authentication without a database'
pubDatetime: 2010-02-22T09:40:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=785'
slug: 2010-02-22-asp-net-mvc-simple-authentication-without-a-database
description: A guide on implementing simple authentication in ASP.NET MVC applications without using a database, including configuration and code examples.
categories:
    - work
tags:
    - asp.net
    - authentication
    - config
    - database
    - mvc
    - password
    - username
---

Sometimes you just need a really simple authentication method in your ASP.NET MVC applications. The default MVC application has the necessary providers setup so that you can have a more flexible Membership system, but if you just want a single username and password, then this will help you.

In your `web.config` change the Authentication section to the following:

```xml
<authentication mode="Forms">
    <forms loginUrl="~/Account/LogOn" timeout="2880">
        <credentials passwordFormat="Clear">
            <user name="test" password="test" />
        </credentials>
    </forms>
</authentication>
```

Then in the AccountModel.cs file, find the method ValidateUser and change the code to the following:

```c#
public bool ValidateUser(string userName, string password) {
    if (String.IsNullOrEmpty(userName)) throw new ArgumentException("Value cannot be null or empty.", "userName");
    if (String.IsNullOrEmpty(password)) throw new ArgumentException("Value cannot be null or empty.", "password");

    return FormsAuthentication.Authenticate(userName, password);
}
```

The default setup should now work without using the provider.