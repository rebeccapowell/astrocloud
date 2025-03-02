---
id: 9999
title: 'Moving Content to Astro'
pubDatetime: 2025-03-01T12:00:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=9999'
slug: 2025-03-01-moving-content-to-astro
description: A guide on migrating blog content to Astro, including exporting from WordPress, setting up Astro, importing Markdown files, and cleaning them up using GitHub Copilot.
categories:
    - work
tags:
    - migration
    - astro
    - markdown
    - github copilot
---

![golden gate bridge](/assets/posts/4175214747_f56502016b_o.jpg)

### Moving Content to Astro

Over the years, my blog has lived in various platforms, including a custom blog written in ASP.NET and XML, Blogger, and multiple versions of WordPress. Recently, I decided to move all my content to Astro, a modern static site generator. This post outlines the process I followed to migrate my blog content to Astro, including code samples and command line instructions. Additionally, I'll summarize the tasks performed by GitHub Copilot during this migration.

#### Exporting Content from WordPress

To begin, I exported all my content from WordPress using a Jekyll exporter plugin. This plugin converts WordPress posts into Markdown files, which are compatible with Astro.

1. Install the Jekyll Exporter plugin in WordPress.
2. Navigate to Tools > Export to Jekyll.
3. Download the exported Markdown files.

Next, I downloaded the Updraft backup for the media files.

#### Setting Up Astro

I forked an Astro template (astroplate) from GitHub, using the preview Astro v5 version of the template that uses Tailwind v4 and Astro v5.

1. Clone the Astroplate repository:
    ```bash
    git clone https://github.com/satnaing/astro-paper.git
    cd astroplate
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

#### Importing Markdown Files

I imported all my Markdown files into the Astro project. The Markdown files were placed in the [blog](http://_vscodecontentref_/0) directory.

1. Copy the exported Markdown files to the Astro project:
    ```bash
    cp -r path/to/exported/markdown/files/* src/data/blog/
    ```

#### Cleaning Up Markdown Files

I used GitHub Copilot to perform a number of tasks on each file to clean them up. Here are some examples of the tasks performed:

1. **Updating Metadata**: Adding or updating metadata fields such as `title`, `description`, `categories`, and `tags`.

2. **Removing Superfluous Tags**: Removing unnecessary HTML tags and comments from the Markdown files.

3. **Converting Inline Code**: Converting inline code snippets to Markdown code blocks.

4. **Fixing Formatting Issues**: Ensuring consistent formatting and fixing any issues with the Markdown syntax.

#### Summary of Tasks Performed by GitHub Copilot

During this session, GitHub Copilot assisted with the following tasks:

1. **Updating Metadata**:
    ```markdown
    ---
    id: 1234
    title: 'Sample Blog Post'
    pubDatetime: 2025-03-01T12:00:00+01:00
    author: rebecca
    layout: '../layouts/BlogPost.astro'
    guid: 'https://rebecca-powell.com/?p=1234'
    slug: 2025-03-01-sample-blog-post
    description: A sample blog post for demonstration purposes.
    categories:
        - work
    tags:
        - sample
        - blog
    ---
    ```

2. **Removing Superfluous Tags**:
    ```markdown
    <!-- Removed unnecessary HTML comments and tags -->
    ```

3. **Converting Inline Code**:
    ```markdown
    ```bash
    npm install
    ```

4. **Fixing Formatting Issues**:
    ```markdown
    # Sample Blog Post

    This is a sample blog post for demonstration purposes.
    ```

By following these steps and utilizing GitHub Copilot, I successfully migrated my blog content to Astro. The process was streamlined and efficient, allowing me to focus on creating new content rather than dealing with technical issues.

I hope this guide helps you in your own migration journey. If you have any questions or need further assistance, feel free to reach out. Happy blogging!