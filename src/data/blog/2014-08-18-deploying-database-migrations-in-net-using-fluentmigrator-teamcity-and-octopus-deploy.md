---
id: 2671
title: "Deploying Database Migrations in .NET Using FluentMigrator, TeamCity, and Octopus Deploy"
pubDatetime: 2014-08-18T10:30:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2671"
slug: 2014-08-18-deploying-database-migrations-in-net-using-fluentmigrator-teamcity-and-octopus-deploy
description: A practical guide to database migrations in .NET using FluentMigrator, covering challenges with existing databases, deployment strategies with Octopus Deploy and TeamCity, and overcoming migration complexities. This post provides insights into automation, version control, and structured schema changes for efficient database management.
categories:
  - work
tags:
  - .net
  - c
  - constraint
  - continuous delivery
  - database
  - deploy
  - deployment
  - fluentmigrator
  - index
  - migrations
  - octopus
  - schema
  - sql
  - table
---

A while back I wanted to set up [database migrations](http://en.wikipedia.org/wiki/Data_migration) on a .NET project I was working on. I had previously been using [Roundhouse](https://github.com/chucknorris/roundhouse) but I have to be honest, I didn't like it.

Too much 'Powershell-foo' and a reliance on the way you named your scripts, plus it didn't work flawlessly with a group of developers and source control. And don't even dare forget to mark your script as 'Build Action - Content', because the whole walls of Jericho come tumbling down if you don't.

I wanted a replacement that worked for me. After a bit of research, I came across [FluentMigrator.net](https://github.com/schambers/fluentmigrator/wiki). At first, I couldn't grok it. It felt a bit like some of the stuff I'd seen in [Ruby Migrations](http://guides.rubyonrails.org/migrations.html) demos. I'd also used [Subsonic](http://subsonicproject.com/docs/Migrations/) (which also has migrations), but I had some key questions:

1. How to work with an existing (mature) database?
2. How to deploy the migrations to production?
3. How to manage a dependency on [.NetTiers](https://code.google.com/p/nettiers/) (historical yuck)?

I posted [the question on StackOverflow](http://stackoverflow.com/questions/22224259/using-fluentmigrator-with-an-existing-database) but it never got any love, nor any responses. Anyway, I managed to solve this problem, and this blog post documents my path through to the solution.

Most of my problems were due to a lack of understanding of how FluentMigrator.net actually works. The GitHub page outlines what FluentMigrator is quite well:

> Fluent Migrator is a migration framework for .NET much like Ruby Migrations. Migrations are a structured way to alter your database schema and are an alternative to creating lots of SQL scripts that have to be run manually by every developer involved. Migrations solve the problem of evolving a database schema for multiple databases (for example, the developer’s local database, the test database, and the production database). Database schema changes are described in classes written in C# that can be checked into version control.

The wiki is missing a short overview of how it works, though. So I'll outline it here:

> FluentMigrator allows developers to create up and down migration scripts using a 'fluent' interface in C#, which is a language most C# developers are familiar with! Most basic SQL commands, such as those to create or update schema, are supported. Examples include creating or altering a table, adding an index, or deleting a foreign key. It supports more complex schema and data changes through embedded or inline scripts. The NuGet package includes an executable called `migrate.exe`, which runs against your compiled assembly. It scans through your assembly for scripts to run, orders them by migration ID, checks which ones have already been run in that database (it looks at a table in the database to see which ones have already run), and then runs each migration in turn until that database is upgraded or downgraded to the correct version as required. `migrate.exe` takes a number of command-line parameters, which allow you to set things like the database connection string and the assembly to run against.

### What is the right way to import an existing database schema?

I couldn't find a 'right way,' but I did find a way that worked for me! I made the following decisions:

1. I set up my first 'iteration' as an empty database. The reasoning for this is that I can always migrate back down to nothing.
2. I [scripted off the entire database](http://stackoverflow.com/questions/1162339/script-entire-database-sql-server) as a baseline. I included all tables, procs, constraints, views, indexes, etc. I set up my first iteration as that baseline. I chose the CREATE option without DROP. This will be my migration up.
3. I ran the same script dump but chose DROP only. This will be my migration down.

The baseline migration just has to use the `EmbeddedScript` method to execute the attached script (I organized the scripts into iteration folders as well).

![project structure](/assets/posts/project-structure.png)

```c#
[Tags(Environments.DEV, Environments.TIERS, Environments.CI, Environments.TEST)]
[Migration(201403061552)]
public class Baseline : Migration
{
    public override void Up()
    {
        this.Execute.EmbeddedScript("BaselineUp.sql");
    }

    public override void Down()
    {
        this.Execute.EmbeddedScript("BaselineDown.sql");
    }
}
```

For each 'sprint' (Agile), I create a new iteration. It helps to keep track of which migrations are expected in the following or preceding releases.

### Deployment with Octopus Deploy

I am using Octopus Deploy, and to be honest, if you are deploying .NET applications, especially to multiple servers, this should be your absolute go-to tool.

At a basic level, [you can hook TeamCity and Octopus Deploy together](https://github.com/ServiceStack/ServiceStack/wiki/Deploy-Multiple-Sites-to-single-AWS-Instance). OD provides two key components:

1. **Octopack** - Wraps up your application as a NuGet package.
2. **TeamCity Plugin** - Builds the NuGet package and offers it as an artifact on a NuGet feed.

Octopus Deploy then consumes that NuGet feed and can deploy those packages to the endpoint servers. Part of this deployment process involves running a PreDeploy and PostDeploy PowerShell script. This is where I run the `migrate.exe` application with my specific tags:

```powershell
function Main ()
{
    Write-Host ("Running migration " + $OctopusEnvironmentName)
    Invoke-Expression "& '$OctopusOriginalPackageDirectoryPathMigrate.exe' --provider sqlserver2008 --tag $OctopusEnvironmentName --a Database.Migrations.dll"
    Write-Host("Migration finished " + $OctopusEnvironmentName)
}
```

My `$OctopusEnvironmentName` matches my tags, ensuring that each environment deployment runs the correct database migrations. The `Database.Migrations` project is selected from the NuGet feed server.

Deployment solved!
