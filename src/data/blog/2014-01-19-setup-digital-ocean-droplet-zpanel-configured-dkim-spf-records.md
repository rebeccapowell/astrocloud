---
id: 1537
title: "How I setup my Digital Ocean droplet with ZPanel and configured the DKIM and SPF records"
pubDatetime: 2014-01-19T10:52:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=1537"
slug: 2014-01-19-setup-digital-ocean-droplet-zpanel-configured-dkim-spf-records
fsb_social_facebook:
  - "0"
description: A detailed guide on setting up a Digital Ocean droplet with ZPanel, and configuring DKIM and SPF records for email authentication, including securing the server and installing Spam Assassin.
categories:
  - work
tags:
  - "digital ocean"
  - dkim
  - dns
  - droplet
  - hosting
  - spf
  - ubuntu
  - vps
  - zpanel
---

I've recently been getting to grips with Digital Ocean's VPS offering; what DO lovingly refer to as "droplets". My plan was to be able to move a bunch of low traffic websites, both personal and for customers, to a Linux based environment. I also wanted to install an easy to use web hosting control panel, and I didn't want to pay much for it.

Enter the following "Dream Team":

- Digital Ocean $5 VPS "Droplet"
- Initial setup of the VPS
- ZPanel installation
- Nameservers switch and glue records
- SPF record setup to help with successful mail delivery
- DKIM (aka DomainKeys) to help with successful mail delivery (primarily to Yahoo mail accounts)
- Spam Assassin

First things first. I'm no Unix administrator. I fact, I'm a Unix noob! I'm going to be relying heavily on the experience and kindness of others who have shared their experiences and bash scripts. For those of you who did this I thank you!

## The Digital Ocean setup

Getting started with Digital Ocean is simple. You sign up for an account, load it up with some credit and you have an account. The next thing you want to do is point a domain name at Digital Ocean's nameservers. For the rest of this article I'm going to use the example of example.com.

Pointing your domain to use Digital Ocean's nameservers is simple. You go to your domain name reseller, login and select the domain. You then select the option to manage the nameservers, and change the namesevers from what ever they were before to ns1.digitalocean.com, and ns2.digitalocean.com. Then you wait and sometimes you wait some more. Eventually you can see your [DNS has propagated across the internet](https://www.whatsmydns.net/) and you'll find that your nameservers are now set to use Digital Ocean's nameservers.

The best guide (the one I followed) was this one from Digital Ocean: [https://www.digitalocean.com/community/articles/how-to-set-up-a-host-name-with-digitalocean](https://www.digitalocean.com/community/articles/how-to-set-up-a-host-name-with-digitalocean)

## How to create your first droplet

[https://www.digitalocean.com/community/articles/how-to-create-your-first-digitalocean-droplet-virtual-server](https://www.digitalocean.com/community/articles/how-to-create-your-first-digitalocean-droplet-virtual-server)

## Initial Server Setup and Securing SSH

[https://www.digitalocean.com/community/articles/initial-server-setup-with-ubuntu-12-04](https://www.digitalocean.com/community/articles/initial-server-setup-with-ubuntu-12-04)

## Protect SSH with Fail2Ban

[https://www.digitalocean.com/community/articles/how-to-protect-ssh-with-fail2ban-on-ubuntu-12-04](https://www.digitalocean.com/community/articles/how-to-protect-ssh-with-fail2ban-on-ubuntu-12-04)

## Protect SSH with 2-factor authentication

[https://www.digitalocean.com/community/articles/how-to-protect-ssh-with-two-factor-authentication](https://www.digitalocean.com/community/articles/how-to-protect-ssh-with-two-factor-authentication)

## Installing ZPanel

[https://www.digitalocean.com/community/articles/how-to-install-and-configure-zpanel-on-an-ubuntu-12-04-vps](https://www.digitalocean.com/community/articles/how-to-install-and-configure-zpanel-on-an-ubuntu-12-04-vps)

## Using the nameservers setup in ZPanel

[https://www.digitalocean.com/community/articles/how-to-create-vanity-or-branded-nameservers-with-digitalocean-cloud-servers](https://www.digitalocean.com/community/articles/how-to-create-vanity-or-branded-nameservers-with-digitalocean-cloud-servers)

## Installing Spam Assassin

[https://www.digitalocean.com/community/articles/how-to-install-and-setup-spamassassin-on-ubuntu-12-04](https://www.digitalocean.com/community/articles/how-to-install-and-setup-spamassassin-on-ubuntu-12-04)

## Fixing the ZPanel DNS Manager

The DNS Manager code in ZPanel screws with the TXT records. The prevent it from doing so, edit some PDP:

> Also in /etc/zpanel/panel/modules/dns_manager/code/controller.ext.php, start line 1491, function CleanRecord

```php
if ($type != 'SPF' && $type != 'TXT')
$data = strtolower($data);
return $data;
```

We'd want the txt/spf records untouched.

More on this here: [http://forums.zpanelcp.com/thread-5709-page-2.html](http://forums.zpanelcp.com/thread-5709-page-2.html)

[http://forums.zpanelcp.com/thread-8345.html?highlight=dkim](http://forums.zpanelcp.com/thread-8345.html?highlight=dkim)

You also need to fix the database table to store long DKIM keys!

```sql
ALTER TABLE x_dns MODIFY dn_target_vc VARCHAR(255);
ALTER TABLE x_dns MODIFY dn_texttarget_tx VARCHAR(255);
```

**As always, backup your database first!**

[http://www.digitalsanctuary.com/tech-blog/debian/setting-up-spf-senderid-domain-keys-and-dkim.html](http://www.digitalsanctuary.com/tech-blog/debian/setting-up-spf-senderid-domain-keys-and-dkim.html)

[http://www.bulkmailserverindia.com/how-to-set-dkim-record-in-zpanel/](http://www.bulkmailserverindia.com/how-to-set-dkim-record-in-zpanel/)

[http://forums.cpanel.net/f43/setting-up-spf-dkim-records-322311.html](http://forums.cpanel.net/f43/setting-up-spf-dkim-records-322311.html)

[https://library.linode.com/linux-tools/common-commands/dig](https://library.linode.com/linux-tools/common-commands/dig)

[http://www.byteslounge.com/tutorials/postfix-opendkim-dkim-configuration-example](http://www.byteslounge.com/tutorials/postfix-opendkim-dkim-configuration-example) <- used

[https://help.ubuntu.com/community/Postfix/DKIM](https://help.ubuntu.com/community/Postfix/DKIM)

[http://www.howtoforge.com/quick-and-easy-setup-for-domainkeys-using-ubuntu-postfix-and-dkim-filter](http://www.howtoforge.com/quick-and-easy-setup-for-domainkeys-using-ubuntu-postfix-and-dkim-filter)

[http://askubuntu.com/questions/134725/setup-dkim-domainkeys-for-ubuntu-postfix-and-mailman](http://askubuntu.com/questions/134725/setup-dkim-domainkeys-for-ubuntu-postfix-and-mailman)
