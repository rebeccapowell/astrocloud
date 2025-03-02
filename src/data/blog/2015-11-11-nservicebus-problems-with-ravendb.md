---
id: 3062
title: 'NServiceBus problems with RavenDb'
pubDatetime: 2015-11-11T11:16:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=3062'
slug: 2015-11-11-nservicebus-problems-with-ravendb
description: Troubleshooting NServiceBus and RavenDb issues in a .NET application, including solutions for GUID formatting errors and corrupted performance counters after a Windows 10 update.
categories:
    - work
tags:
    - error
    - nservicebus
    - perf
    - ravendb
---

I work on a .NET application that uses NServiceBus. Under the hood, NServiceBus uses RavenDb for persisting data and state. I hadn't needed to work on this part of the application for a while, but today I needed to get NServiceBus up and running again.

Unfortunately it wouldn't work. NServiceBus kept crashing out with the error:

```bash
Exception when starting endpoint, error has been logged. 
Reason: Guid should contain 32 digits with 4 dashes (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
```

What had happened since I had last run NServiceBus last. Ah yes, Windows 10...

I decided to reinstall the RavenDb Windows service. You can do this relatively easily by opening a command prompt in the RavenDb folder where the raven.server.exe file lives and typing these two lines:

```powershell
raven.server.exe -uninstall
raven.server.exe -install
```

There was also another error being raised internally:

```bash
NServiceBus performance counter for Critical Time not set up correctly. 
Please run the NServiceBus infrastructure installers to rectify this problem
```

Because we are using NServiceBus v3 rather than v4 (upgrading our application would more than likely be painful and currently it just works - never touch a running system and all that), I checked the RavenDb version support. A colleague was running [build 2910](http://hibernatingrhinos.com/downloads/RavenDB/2910), so I decided to do the same.

After installing RavenDb again the initial problem was still apparent and a bit of Googling led me to [a StackOverflow post about corrupted NServiceBus performance counters](http://stackoverflow.com/questions/18760469/cant-get-nservicebus-performance-counters-to-work-in-development-self-host-on-w).

After rebuilding the performance counters using **lodctr /R**, everything started working again. Note that if you are on 64 bit Windows, you'll need to run that command under **syswow64** and not **system32**.

```powershell
PS C:\Windows\system32> cmd
Microsoft Windows [Version 6.2.9200]
(c) 2012 Microsoft Corporation. All rights reserved.

C:\Windows\system32>lodctr /R

Error: Unable to rebuild performance counter setting from system backup store, error code is 2
C:\Windows\system32>cd ..

C:\Windows>cd syswow64

C:\Windows\SysWOW64>lodctr /R

Info: Successfully rebuilt performance counter setting from system backup store
C:\Windows\SysWOW64>winmgmt.exe /RESYNCPERF
```

Happy NServiceBus-ing...