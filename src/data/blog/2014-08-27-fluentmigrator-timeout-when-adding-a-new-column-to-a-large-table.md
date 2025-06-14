---
id: 2694
title: "FluentMigrator timeout when adding a new column to a large table"
pubDatetime: 2014-08-27T13:00:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2694"
slug: 2014-08-27-fluentmigrator-timeout-when-adding-a-new-column-to-a-large-table
description: Discusses the challenges and solutions for adding a new column to a large table using FluentMigrator, including handling timeouts and adjusting SQL command timeout settings.
categories:
  - work
tags:
  - column
  - fluentmigrator
  - sql
---

I recently had the requirement to add a new column to a large but not massive table, which had over 12 million rows. I needed to allow logical deletes, so I needed to add a boolean (BIT) column to that table. Arguably, I should have created the table originally with such a column, but hindsight is always 20-20.

My FluentMigrator script was simple:

```csharp
[Migration(201407221626)]
public class LogicalDeleteMyTable : Migration
{
  public override void Up()
  {
    // new column mimetype
    this.Alter.Table("MyTable")
    .AddColumn("IsDeleted")
    .AsBoolean()
    .NotNullable()
    .WithDefaultValue(0);
  }

  public override void Down()
  {
    this.Delete.Column("IsDeleted").FromTable("MyTable");
  }
}
```

We have a number of automatic deployments for database migration using FluentMigrator.NET. The first few deployments were running against small test databases. Our test database has a bit of data in it, but nothing like the volume in production.

Luckily we had decided to pull back a copy of production to our UAT environment for this deployment. I was also working on a few anonymization and data archiving scripts, so I had needed a copy of production anyway. This turned out to be our saving grace.

As I said earlier, the production table had just over 12.5 million rows in it. When the FluentMigrator process step kicked off in Octopus Deploy, the script eventually timed out. Rather than immediately try and rework the script, I decided to up the timeout. Digging around in the FluentMigrator.NET settings wiki, I found that <a href="https://twitter.com/paulstovell">Paul Stovell</a> had very smartly added a <a href="https://github.com/schambers/fluentmigrator/wiki/Command-Line-Runner-Options#--timeoutvalue-optional">SQL command timeout override (in seconds)</a> as a <a href="https://github.com/schambers/fluentmigrator/wiki/Command-Line-Runner-Options">command line runner option/flag/parameter</a>:

```powershell
migrate --conn "server=.\SQLEXPRESS;uid=testfm;pwd=test;Trusted_Connection=yes;database=FluentMigrator" --provider sqlserver2008 --assembly "..\Migrations\bin\Debug\Migrations.dll" --task migrate --timeout 300
```

I tried a few more times whilst continually extending the timeout value, but&nbsp;the runner still timed out. Finally I extended the timeout to 10 minutes (600 seconds) and the script completely successfully. Wheeew!

In a future post I intend to cover ways in which you can add new columns to extremely large columns without such a performance hit.
