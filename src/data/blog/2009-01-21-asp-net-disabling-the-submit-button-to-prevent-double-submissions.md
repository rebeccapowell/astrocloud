---
id: 802
title: "ASP.NET - Disabling the submit button to prevent double submissions"
pubDatetime: 2009-01-21T15:38:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=802"
slug: 2009-01-21-asp-net-disabling-the-submit-button-to-prevent-double-submissions
description: A solution for preventing double submissions in ASP.NET applications by creating a custom button that disables itself upon being clicked.
categories:
  - work
tags:
  - asp.net
  - disable
  - double
  - submit
---

If a user clicks on a form submit button and the page response is slow, the user may often re-click that button. Because the original request has already been submitted, you may find that the user has made a double submission. In e-commerce sites, the double submission of a credit card payment may be very unpopular with your customers.

This is a common problem faced by web developers, and there are a variety of ways to try to prevent it. However, I have not seen a really elegant way to solve the problem, so I set about trying to find a simple and effective solution.

There were some key issues I wanted to address:

1. I wanted to disable the button when it was clicked, but only if the page was valid
2. I did not want to manually add code to every button in my application
3. I did not want to break the existing validation, especially when using validation groups
4. I wanted to preserve the CausesValidation property

To achieve these goals, I set about creating a custom button that inherited the standard ASP Button. This custom button would replace the existing buttons in my application.

First, add a new class to your App_Code directory called "EnhancedButton" and then override the `OnPreRender` event:

```csharp
namespace My.WebControls {
    [ToolboxData("<{0}:EnhancedButton runat=server>")]
    public class EnhancedButton : Button {
        protected override void OnPreRender(EventArgs e) {
            if (this.CausesValidation) {
                StringBuilder sb = new StringBuilder();
                sb.Append("if (typeof(Page_ClientValidate) == 'function') { ");
                sb.Append("if (Page_ClientValidate('" + this.ValidationGroup + "') == false) { return false; }} ");
                sb.Append("this.value = 'Please wait...';");
                sb.Append("this.disabled = true;");
                sb.Append(this.Page.GetPostBackEventReference(this));
                sb.Append(";");
                this.Attributes.Add("onclick", sb.ToString());
            }

            base.OnPreRender(e);
        }
    }
}
```

Now, we add the following to our web.config to take advantage of the tagMapping feature:

```xml
<system.web>
    <pages>
        <tagMapping>
            <add tagType="System.Web.UI.WebControls.Button" mappedTagType="My.WebControls.EnhancedButton" />
        </tagMapping>
    </pages>
</system.web>
```

The result is that all instances of standard Buttons are replaced with our new Enhanced custom button. You have no need to add extra code in every Page_Load. The Tag Mapping takes care of replacing the standard button across the web application.

And&nbsp;Voilà, our job is done!
