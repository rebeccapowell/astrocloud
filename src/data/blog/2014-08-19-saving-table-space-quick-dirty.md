---
id: 2642
title: "Saving Table Space Quick And Dirty"
pubDatetime: 2014-08-19T05:26:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=2642"
slug: 2014-08-19-saving-table-space-quick-dirty
description: A practical guide on reducing database space usage with a SQL script that identifies tables with high data-per-row ratios, helping to improve database performance.
categories:
  - work
tags:
  - database
  - size
  - table
  - performance
  - optimization
---

One of the quickest and easiest ways to make a database more performant is to reduce how much space the data takes up. Here’s a script that I wrote that’ll find each table in a database (run it in the context of the database). This script determines how many rows of data each table has (in kilobytes), determines the size of the data in the table, and then gives you a ratio of data per row. The higher a data/row ratio the more likely there is a chance of reducing the amount of space.

```sql
DECLARE @tables TABLE
(
    name VARCHAR (MAX),
    ID INT IDENTITY (1,1),
    cnt INT,
    SIZE INT
)
DECLARE @i INT, @count INT, @name VARCHAR (MAX),@sql VARCHAR (MAX)

INSERT INTO
        @tables (name)
SELECT
        TABLE_SCHEMA + '.' + TABLE_NAME
FROM
        INFORMATION_SCHEMA.tables
WHERE
        TABLE_TYPE = 'base table'

SELECT
    @count = COUNT (*)
FROM
    @tables

SET @i = 1
WHILE @i <= @count
BEGIN
    CREATE TABLE #temp (
        name VARCHAR (MAX),
        ROWS VARCHAR (MAX),
        reserved VARCHAR (MAX),
        DATA VARCHAR (MAX),
        index_size VARCHAR (MAX),
        unused VARCHAR (MAX)
    )
    SELECT
        @name = name
    FROM
        @tables
    WHERE
        ID = @i

    INSERT INTO #temp (
        name,
        ROWS,
        reserved,
        DATA,
        index_size,
        unused
    )

    EXEC sp_spaceused @name
    UPDATE @tables SET
        SIZE = LEFT (DATA, LEN (DATA) - 3),
        cnt = ROWS
    FROM
        #temp a
    CROSS JOIN @tables b
    WHERE
        b.id = @i
    DROP TABLE #temp

    SET @i = @i + 1
END

SELECT
    *,
    (SIZE * 1.0) / cnt AS Ratio
FROM
    @tables
WHERE
    cnt > 0
ORDER BY
    (SIZE * 1.0) / cnt DESC
```

<p><a href="http://blogs.lessthandot.com/index.php/datamgmt/datadesign/saving-table-space-quick-and/">Less Than Dot - Blog - Saving Table Space Quick And Dirty</a>.</p>
