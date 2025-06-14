---
id: 802
title: "MMS Email Photo Blogging"
pubDatetime: 2003-10-10T17:22:52+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=802"
slug: 2003-10-10-mms-email-mobile-photo-blogging
description: A guide on how to automatically pick up MMS emails, extract the images, and post them as a "moblog" using ASP.NET, including POP3 integration, scheduling, and displaying images.
categories:
  - work
tags:
  - asp
  - pop3
  - mms
  - mobile
  - blogging
---

A couple of weeks ago I talked about my new Nokia 7250i and its ability to send MMS via email. I wanted to automatically pick up those emails, extract the images and post them as a "moblog". I have now completed most of the code to do this, and felt that it would be nice of me to share some of the code to help others do the same.

First of all I needed to develop something to connect to my POP3 email account. I first looked to third party resources that did just that, but to my surprise - no one has developed a free one yet. I looked at developing my own class, which was successful in terms of downloading the email, but parsing it was just a huge nightmare. I then managed to find a free fully functional component developed by devmail.net that has reduced functionality after 15 days. Luckily for me the reduced functionality is that only one attachment can be downloaded during one session and only the first 50kb. The MMS images at the largest size are 352px by 288px and have max size it seems of about 20kb. Therefore even when this component goes into reduced functionality mode, it should still work (I hope so anyway - we'll have to wait and find out!!).

So to access your POP3 inbox and enumerate the emails the following code (almost exact to one of devmail.net's samples). Note that your will need to enter your own POP3 settings!!

```vb
'Create the POP3 and a msg objects
Dim Inbox As New POP3()
Dim msg As New MailMessage()

Dim att As Attachment
Dim sFolder As String
Dim sFileName As String
Dim iNumberOfMessages As Integer
Dim iIndex As Integer = 0

'Provide the connection info
Inbox.Username = "youremail@yourserver.com"
Inbox.Password = "thepassword"
Inbox.Host = "mail.yourserver.com"

Response.Write("Connecting to " & Inbox.Host & vbLf)

Dim iIdx As Integer

'Try to connect
If Inbox.Connect() = True Then

    'Connected
    Response.Write("Connected at " & Now() & vbLf)
    sFolder = Server.MapPath("/path_to_extract_to/") & "\"

    'Get the number of messages
    iNumberOfMessages = Inbox.NumberOfMessages

    'Enumerate messages
    For Each msg In Inbox
        iIndex += 1
        Response.Write("Retrieving message " & iIndex & " of " & iNumberOfMessages & "... " & Int((iIndex * 100) / iNumberOfMessages) & "% complete." & vbLf)

        'MsgBox(msg.Attachments.Count & " : " & msg.InlineAttachments.Count & " : " & msg.HasAttachments)

        'Enumerate attachments and save as files
        For Each att In msg.Attachments
            att.SaveToFile(sFolder & att.FileName)
            Response.Write("Saved message to: /path_to_extract_to/" & att.FileName & vbLf)
            ' Store the info somwhere
            AddMoblog("MMS Image Post", "/path_to_extract_to/" & att.FileName)
        Next
        msg.Delete(False)
        Response.Write("Deleted message" & vbLf)
    Next

    'Disconnect
    Inbox.Disconnect()
    Response.Write("Total " & iNumberOfMessages & " messages downloaded." & vbLf)
Else
    Response.Write("Error: " & Inbox.LastError & vbLf)
End If
```

Once I had this I was happily extracting the images to the server, but I had no way to automate this. I looked around the internet for examples of scheduling ASP.NET scripts only to find that it can't be done in any particularly elegant way. I don't have terminal server access to this box as it's shared hosting, so I therefore I need another option. That option turned out to be a LINUX based solution. I have access to a LINUX box with PHP. The ability to schedule a task using CRON is easy under LINUX, so I created a small PHP script that would be called periodically. I also wanted to be notified by email to have a record of all of the MMS posts historically. Here is the code to do this:

```php
<?php
## What:  call to extract
## Date:  10th October 2003
## How:  Screenscape and eval result
##   Email if result is not 0 messages
$url = "http://www.yourserver.com/extractor.aspx";
$myinfo = implode(" ", file($url));

echo $myinfo;
## echo substr_count($myinfo, "Total 0 messages downloaded.");
if ( substr_count($myinfo, "Total 0 messages downloaded.") == 0) {
 $to = "notify@yourserver.com";
 $from_header = "From: Extractor Scheduler";
 mail($to, "Mail Report", $myinfo, $from_header);
}
?>
```

Now we want to display the uploaded images. The way I did this was really a bit of a cheat by using the existing blog XML when I posted the moblog entry. I set the title to a value that would always remain the same (so I could filter it out from normal posts) and then placed the file location as the text of the blog.

I felt that the best way to get the blog images neatly onto my blog page was to create a neat little Web User Control. If you haven't looked at user controls then I suggest you do - they are awesome. Much of this page is built from these controls. The UC contained nothing more than a small datagrid with a single template column that displays the image. The page size is set to one picture only and has the default next and previous buttons to scroll through the images. Your datagrid should look something like this:

```javascript
<script type="text/javascript" language="JavaScript">
function MM_openBrWindow(theURL,winName,features) {
 window.open(theURL,winName,features);
}
function showFullPic(pic) {
 MM_openBrWindow(pic,"pic","width=400,height=300,resizable");
}
</script>
<asp:datagrid id="dgMoblogs" runat="server" PageSize="1" AllowPaging="True" OnPageIndexChanged="NewPage" AllowSorting="true" PagerStyle-Mode="NumericPages" PagerStyle-HorizontalAlign="Left" AutoGenerateColumns="False" CellPadding="1" CellSpacing="1" GridLines="None" ShowHeader="False">
 <Columns>
  <asp:TemplateColumn>
   <ItemTemplate>
    <a href="javascript: void(null)" onclick='javascript: showFullPic("<%# DataBinder.Eval ( Container.DataItem, "logText" ) %>")'><img alt="click for larger view" src='<%# DataBinder.Eval ( Container.DataItem, "logText" ) %>' width="200" height="164" border="0"></a>
   </ItemTemplate>
  </asp:TemplateColumn>
 </Columns>
 <PagerStyle HorizontalAlign="Left" Mode="NextPrev"></PagerStyle>
</asp:datagrid>
```

Behind the scenes you need to cope with a new page event (next and previous) and also filter the blog entries to the MMS posts only. If there are no posts available then we hide the datagrid:

```vb
Dim dsWebLog As DataSet
Protected WithEvents dgMoblogs As System.Web.UI.WebControls.DataGrid
Dim dvWeblog As DataView

Private Sub Page_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
 'Put user code to initialize the page here
    'get our cached dataset
    dsWebLog = GetDS()
    'get a dataview from a copy of the cached dataset
    dvWeblog = dsWebLog.Copy.Tables(0).DefaultView
    If Not IsPostBack Then
  ' need to load this data only once
        BindGrid()
    End If

End Sub

Sub BindGrid()
    'dgMoblogs.Columns(0).Visible = False
    'get a dataview from a copy of the cached dataset
    dvWeblog.RowFilter = "logTitle = 'MMS Image Post'"
    dgMoblogs.DataSource = dvWeblog
    If dvWeblog.Count = 0 Then
        dgMoblogs.Visible = False
    Else
        dgMoblogs.DataBind()
    End If
End Sub

Public Sub NewPage(ByVal sender As System.Object, ByVal e As DataGridPageChangedEventArgs)
    dgMoblogs.CurrentPageIndex = e.NewPageIndex
End Sub
```

Once you have created your user control you can then just drag it into whatever page you wish to display it on, and hey hesto - mobile MMS photos!!
