---
id: 782
title: "ASP.NET Tip: If your DropDownList items are lost on postback"
pubDatetime: 2010-04-28T19:55:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=782"
slug: 2010-04-28-asp-net-tip-if-your-dropdownlist-items-are-lost-on-postback
description: A tip for ASP.NET developers on how to handle DropDownList items being lost on postback by understanding the behavior of EnableViewState.
categories:
  - work
tags:
  - asp.net
  - dropdownlist
  - postback
  - webforms
---

This might seem obvious but it had me stumped for a while. Most ASP.NET programmers should know that if you set `EnableViewState` to false on a DropDownList, the items that were bound to that control will not be persisted on postback. What you might forget (as I did) is that if your DropDownList (or any other DataBound control for that matter) is held within another control (such as a Panel) that has view state disabled, then it also applies to anything contained within that control.

I added a DevExpress Panel to my MasterPage surrounding a ContentHolder, then wondered why none of my DropDownLists were working correctly.

Mental note for me to remeber this one for the future.

## Example

Here is an example to illustrate the issue and the solution:

### ASPX Page

```aspx
<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="WebApplication1._Default" %>

<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title>DropDownList ViewState Example</title>
</head>
<body>
    <form id="form1" runat="server">
        <div>
            <asp:Panel ID="Panel1" runat="server" EnableViewState="false">
                <asp:DropDownList ID="DropDownList1" runat="server">
                    <asp:ListItem Text="Item 1" Value="1"></asp:ListItem>
                    <asp:ListItem Text="Item 2" Value="2"></asp:ListItem>
                    <asp:ListItem Text="Item 3" Value="3"></asp:ListItem>
                </asp:DropDownList>
            </asp:Panel>
            <asp:Button ID="Button1" runat="server" Text="Submit" OnClick="Button1_Click" />
        </div>
    </form>
</body>
</html>
```
