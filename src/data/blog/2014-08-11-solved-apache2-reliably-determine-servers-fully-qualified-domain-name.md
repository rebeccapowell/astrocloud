---
id: 2645
title: "SOLVED - apache2: Could not reliably determine the server's fully qualified domain name"
pubDatetime: 2014-08-11T09:22:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2645"
slug: 2014-08-11-solved-apache2-reliably-determine-servers-fully-qualified-domain-name
description: A solution to the Apache2 error "Could not reliably determine the server's fully qualified domain name," including steps to configure ServerName and correct the hosts file on a Digital Ocean VPS with VirtualMin.
categories:
  - work
tags:
  - apache2
  - server
  - configuration
  - troubleshooting
  - virtualmin
---

This has been annoying me for a while. I have a Digital Ocean VPS (droplet) running Ubuntu. This provides me with some email accounts and a couple of WordPress sites.

I've been receiving this error for a few weeks since I setup VirtualMin:

```bash
AH00558: apache2: Could not reliably determine the server's
fully qualified domain name, using blah.com. Set the 'ServerName'
directive globally to suppress this message
```

N.B. For this demo my VirtualMin installation is installed on `panel.virtualmin-domain.com` and the machine name is set to `panel`.

The usual answer to this appeared to be that apache2 needs the appropriate ServerName configured. I checked through each apache2 domain conf file, and all had an appropriate ServerName correctly set in the conf. To check this do the following:

```bash
sudo nano /etc/apache2/sites-available/
ls
```

Your available VirtualMin sites should be listed, i.e.

```bash
000-default.conf
default-ssl.conf
domain.com.conf
```

Each conf file should have the appropriate ServerName entry. For example the 000-default.conf should look like this:

```bash
ServerName panel.virtualmin-domain.com
```

To open and edit the file you can use nano:

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

If it doesn't exist then enter the name and restart apache2:

```bash
sudo /etc/init.d/apache2 restart
```

If you still get the same error (like I did) something else is mis-configured. For me the problem lay in my hosts configuration.

To check your hosts configuration type:

```bash
sudo nano /etc/hosts
```

It should look like this:

```bash
127.0.0.1 localhost
0.0.0.0 panel.virtualmin-domain.com panel
```

Where 0.0.0.0 is your Digital Ocean external IP address. Mine was mis-configured:

```bash
127.0.0.1 localhost
127.0.0.1 panel.virtualmin-domain.com panel # this extra line was causing the problem
0.0.0.0 panel.virtualmin-domain.com panel
```

I removed the offending line, rest the hostname and restarted apache2:

```bash
sudo hostname -F /etc/hostname
sudo /etc/init.d/apache2 restart
```

The result is now nice and error free:

```bash
root@panel:/etc/apache2/sites-available# /etc/init.d/apache2 restart
 * Restarting web server apache2                                         [ OK ]
```

Job done.
