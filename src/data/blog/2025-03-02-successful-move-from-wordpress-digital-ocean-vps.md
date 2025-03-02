---
id: 10001
title: 'Moving from WordPress on Digital Ocean VPS to Cloudflare Pages and Astro SSG'
pubDatetime: 2025-03-02T17:45:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=10000'
slug: 2025-03-02-moving-from-digital-ocean-to-cloudflare-pages
description: A step-by-step guide on migrating from WordPress on Digital Ocean VPS to Cloudflare Pages and Astro SSG, including integrating Giscus comments and other benefits.
featured: true
categories:
  - work
tags:
  - astro
  - blog
  - wordpress
  - cloudflare
---

### Background

I've been a customer of Digital Ocean for about ten years, initially running an Ubuntu VPS server with Virtualmin/Webmin, and later moving to Plesk. However, when Plesk changed its licensing model and Let's Encrypt SSL renewals stopped working, I decided it was time for a change. I wanted a cheaper, ideally free, alternative. This guide outlines how I successfully migrated my blog from WordPress on a Digital Ocean VPS to Cloudflare Pages and Astro SSG.

### Old Setup: WordPress on Digital Ocean VPS

#### Pros:
- **Control**: Full control over the server environment.
- **Flexibility**: Ability to install and configure any software.
- **Familiarity**: Long-term use and familiarity with WordPress.

#### Cons:
- **Cost**: Approximately $20 per month for the VPS.
- **Maintenance**: Regular updates and maintenance required for the server and WordPress.
- **Security**: Constant need to monitor and secure the server.
- **Performance**: Dependent on server resources and configuration.

### New Setup: Cloudflare Pages and Astro SSG

#### Pros:
- **Cost**: Free tier available on Cloudflare Pages.
- **Performance**: Fast load times with Cloudflare's global CDN and Astro's static site generation.
- **Security**: Built-in SSL and DDoS protection from Cloudflare.
- **Ease of Deployment**: GitHub integration for seamless deployment.
- **Simplicity**: No need for a database or server-side code with Astro.

#### Cons:
- **Learning Curve**: Initial learning curve for Astro and Cloudflare Pages.
- **Customization**: Limited to static site capabilities (though Astro is highly flexible).

### Step 1: Cloudflare Pages

Cloudflare Pages is a JAMstack platform for frontend developers to collaborate and deploy websites. It offers several benefits over a traditional VPS setup:

- **Ease of Deployment**: With GitHub integration, you can deploy your site by simply pushing changes to your repository.
- **Performance**: Cloudflare's global CDN ensures fast load times for your site.
- **Security**: Built-in SSL and DDoS protection.
- **Cost**: Cloudflare Pages offers a generous free tier, making it a cost-effective solution.

### Step 2: Cloudflare Domains

Using Cloudflare for domain management offers several advantages:

- **DNS Management**: Cloudflare's DNS is fast and reliable.
- **SSL/TLS**: Easily manage SSL certificates.
- **Security**: Protect your site with Cloudflare's security features.
- **Cost**: CloudFlare charge for domains and renewals at cost.

### Step 3: Astro

Astro is a modern static site generator that offers several benefits over WordPress:

- **Performance**: Astro generates static HTML, resulting in fast load times.
- **Simplicity**: No need for a database or server-side code.
- **Flexibility**: Use any frontend framework (React, Vue, Svelte, etc.) or none at all.
- **SEO**: Astro's static HTML output is SEO-friendly.

### Step 4: Integrating Giscus for Comments

Giscus is a comments system powered by GitHub Discussions. It integrates seamlessly with Astro and offers several benefits:

- **GitHub Integration**: Uses GitHub Discussions for comments.
- **Moderation**: Manage comments through GitHub.
- **Customization**: Easily customize the appearance and behavior.

### Conclusion

By migrating my blog from WordPress on a Digital Ocean VPS to Cloudflare Pages and Astro, I achieved several benefits:

- **Cost Savings**: Reduced hosting costs from approximately $20 per month to $0.
- **Performance**: Improved site performance with Cloudflare's CDN and Astro's static site generation.
- **Security**: Enhanced security with Cloudflare's built-in features.
- **Simplicity**: Simplified deployment and management with GitHub integration and Astro's static site generation.

Specifically with regards to performance:

![Pagespeed Insights Results for this website - 100 across the board](/assets/posts/pagespeed-insights-results.png)

I hope this guide helps you in your own migration journey. If you have any questions or need further assistance, feel free to reach out. Happy blogging!

