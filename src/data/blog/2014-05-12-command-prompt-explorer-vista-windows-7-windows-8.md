---
id: 2593
title: "Command prompt here in Explorer Vista, Windows 7 and Windows 8"
pubDatetime: 2014-05-12T10:27:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2593"
slug: 2014-05-12-command-prompt-explorer-vista-windows-7-windows-8
description: A guide on opening a command prompt from Windows Explorer in Vista, Windows 7, and Windows 8, including adding a Visual Studio Command Prompt to the context menu and using Git Bash for Unix-like tools.a command prompt from Windows Explorer in Vista, Windows 7, and Windows 8, including adding a Visual Studio Command Prompt to the context menu and using Git Bash for Unix-like tools.
categories:
  - work
tags:
  - bash
  - command
  - git
  - prompt
  - unix
  - "visual studio"
  - "visual studio 2012"
  - "visual studio 2013"
  - windows
  - "windows 7"
  - "windows 8"
  - "windows vista"
---

As a developer, the ability to open a command prompt from within Explorer in the current folder, or selected folder is really useful. The alternative is to navigate using "cd whatever". Well, not so obviously, Windows versions since Vista have a neat little feature that allows you to open up a command window from a selected folder from within Windows Explorer.bility to open a command prompt from within Explorer in the current folder, or selected folder is really useful. The alternative is to navigate using "cd whatever". Well, not so obviously, Windows versions since Vista have a neat little feature that allows you to open up a command window from a selected folder from within Windows Explorer.

The trick is to right-click on the folder you want to open in command prompt using SHIFT right-click and then selecting "Open Command Window here".click on the folder you want to open in command prompt using SHIFT right-click and then selecting "Open Command Window here".

Credit goes to [@clawr on StackOverflow](http://stackoverflow.com/a/379804/119624) for this.r on StackOverflow](http://stackoverflow.com/a/379804/119624) for this.

If you want a Visual Studio Command Prompt here, then you can add this to the registry. Here is an example for Visual Studio 2013:tudio Command Prompt here, then you can add this to the registry. Here is an example for Visual Studio 2013:

```powershell
Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Folder\shell\Command Line VS2013]FTWARE\Classes\Folder\shell\Command Line VS2013]
[HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Folder\shell\Command Line VS2013\command][HKEY_LOCAL_MACHINE\SOFTWARE\Classes\Folder\shell\Command Line VS2013\command]
@="cmd.exe /k echo on & pushd \"%1\" & \"C:\\Program Files (x86)\\Microsoft Visual Studio 12.0\\Common7\\Tools\\VsDevCmd.bat\"" & pushd \"%1\" & \"C:\\Program Files (x86)\\Microsoft Visual Studio 12.0\\Common7\\Tools\\VsDevCmd.bat\""
```

If you want a different version of Visual Studio then change the version number! Credit goes to [Chris Carroll](http://www.cafe-encounter.net/p1614/visual-studio-2013-command-prompt-for-explorer-context-menu).If you want a different version of Visual Studio then change the version number! Credit goes to [Chris Carroll](http://www.cafe-encounter.net/p1614/visual-studio-2013-command-prompt-for-explorer-context-menu).

If you want Linux style tools on Windows, I.e. those commands which you find on Unix systems (e.g. Ubuntu, Debian, etc) then I find it easiest to install [Git Bash](http://git-scm.com/downloads).
