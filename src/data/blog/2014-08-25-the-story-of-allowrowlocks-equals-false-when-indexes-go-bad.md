---
id: 2680
title: 'The story of AllowRowLocks equals false. When indexes go bad.'
pubDatetime: 2014-08-25T11:55:00+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=2680'
slug: 2014-08-25-the-story-of-allowrowlocks-equals-false-when-indexes-go-bad
description: Discusses the challenges and solutions related to SQL Server indexes with AllowRowLocks set to false, including troubleshooting deadlocks and failed deletes, and provides guidance on enabling row locks.
categories:
    - work
tags:
    - allowrowlocks
    - concurrency
    - deadlock
    - granularity
    - index
    - 'sql server'
---

I had a bad day yesterday. It was a combination of factors that took a total of six years to appear. This is the story of indexes gone bad. All because of a single index flag - AllowRowLocks.

For years we had a database that just worked, with a variety of applications connecting to it on a daily basis with a large number of users. Then a couple of months ago we changed the way our core application connected to the database. Boom... deadlocks, failed deletes, the pain just got worse and worse, and there was no obvious reason.

There were no clear exceptions being logged in the event log. The cause was not obvious. We were testing the same release code in a multitude of testing and staging environments, and in every case the code worked. But it didn't work in production. WTF? The code itself was simple. It was deleting a single row in the database via ADO.NET.

I watched the web application make the request back to the server, then saw no error, then watched the record seem to miraculously re-appear. It made no sense. Why wasn't the record being deleted? Why was there no error?

I thought I was going crazy so I asked a colleague to do a code review with me. He thought it looked OK too, so he suggested we use SQL Profiler to see what was going on. We saw the TSQL batch go across. The delete was there, then the code retried the request 4 more times, then silently failed. What was going on? We decided to run the request ourselves manually. Interestingly it wasn't doing what we expected:

```sql
DELETE FROM myTable WHERE Id = X
```
It was doing the delete with a ROWLOCK requested:

```sql
DELETE FROM myTable WITH (ROWLOCK) WHERE Id = x
```
Running this query directly gave us the following error:

```bash
Cannot use the ROW granularity hint on the table because locking at the specified granularity is inhibited.
```
That nice error (thanks Microsoft) [basically means](http://www.toadworld.com/platforms/sql-server/b/weblog/archive/2012/04/29/cannot-use-the-row-granularity-hint-on-the-table-because-locking-at-the-specified-granularity-is-inhibited.aspx):

>The WITH (ROWLOCK) query option is not compatible with ALLOWROWLOCKS=FALSE on a table index.

The fix is simple:

1. Disable the index or change the index to enable row locks.
2. Use page locks or table locks instead.

The general advice is that [you should leave both row and page locking on unless you have a damn good reason not to](http://technet.microsoft.com/en-us/library/ms189076(v=sql.105).aspx), so that the SQL Server Database engine can work out its own locks. This diagram from MSDN shows the trade-off you are making when it comes to locking:

![Why AllowRowLocks matters](https://rebecca-powell.com/wp-content/uploads/2014/08/IC369471.gif)

Needless to say, we had indexes that had forcibly switched row locks off. More [detailed information concerning the different types of index locks](http://www.sqlserver-dba.com/2012/06/how-to-decide-on-index-allow_row_locks-and-allow_page_locks.html) can be seen a SQLServer-dba.com:

**Question:**

What does the ALLOW_ROW_LOCKS and ALLOW_PAGE_LOCKS mean on the CREATE INDEX statement ? What is the costbenefit of ON|OFF? Is there a performance gain?

**Answer:**

1. SQL Server takes locks at different levels – such as table, extent, page, row. 
    - *ALLOW_PAGE_LOCKS and ALLOW_ROW_LOCKS decide on whether ROW or PAGE locks are taken.*
    - If ALLOW_PAGE_LOCKS = OFF, the lock manager will not take page locks on that index. The manager will only user row or table locks
    - *If ALLOW_ROW_LOCKS = OFF , the lock manager will not take row locks on that index. The manager will only use page or table locks.*
    - If ALLOW_PAGE_LOCKS = OFF and ALLOW_PAGE_LOCKS = OFF , locks are assigned at a table level only
    - If ALLOW_PAGE_LOCKS = OFF and ALLOW_PAGE_LOCKS = OFF , locks are assigned at a table level only
    - If ALLOW_PAGE_LOCKS = ON and ALLOW_PAGE_LOCKS = ON , SQL decides on which lock level to create according to the amount of rows and memory available.
2. Consider these factors , when deciding to change the settings. **There has to be an extremely good reason , backed up by some solid testing before you can justify changing to OFF**

I found [a nice bit of advice on StackOverflow](http://stackoverflow.com/a/3006104/119624) from [@Guffa](http://stackoverflow.com/users/69083/guffa) concerning the use of WITH(ROWLOCK):

>The with (rowlock) is a hint that instructs the database that it should keep locks on a row scope. That means that the database will avoid escalating locks to block or table scope. You use the hint when only a single or only a few rows will be affected by the query, to keep the lock from locking rows that will not be deleted by the query. That will let another query read unrelated rows at the same time instead of having to wait for the delete to complete. If you use it on a query that will delete a lot of rows, it may degrade the performance as the database will try to avoid escalating the locks to a larger scope, even if it would have been more efficient. The database is normally smart enough to handle the locks on it's own. It might be useful if you are try to solve a specific problem, like deadlocks.

Another blogger (Robert Virag) at SQLApprentice [states in his conclusion](http://www.sqlapprentice.net/?p=144) concerning AllowRowLocks and deadlock scenarios:

>In case of high concurrency (especially writers) set ALLOW_PAGE_LOCK and ALLOW_ROW_LOCK to ON!

So how do you fix this, and on a large table is this going to cause me a timely index rebuild? You can use the procedure sp_indexoption to change the options on indexes, although this is due to be phased out in favour of ALTER INDEX (TSQL) after SQL Server 2014. The syntax to ALLOWROCKLOCKS looks like this:

```sql
ALTER INDEX IX_Customer_Region
ON DBO.Customer
SET
(
ALLOW_ROW_LOCKS = ON
);
GO
```
You can also identify any other indexes that have row locks switched off (ALLOW_ROW_LOCKS = 0):

```sql
SELECT
  name,
  type_desc,
  allow_row_locks,
  allow_page_locks
FROM sys.indexes
WHERE allow_row_locks = 0 -- OR allow_page_locks = 0 -- if you want
```
Now armed with that we can take a look at the statistics for each specific index:

```sql
DBCC SHOW_STATISTICS(Customer, IX_Customer_Region)
```
Notably, [Thomas Stringer](http://dba.stackexchange.com/users/2241/thomas-stringer) also [notes](http://dba.stackexchange.com/a/74672/45757) that the BOL reference states:

>Specifies index options without rebuilding or reorganizing the index

Job done. Now repeat for each problematic AllowRowLocks index. You could write a script to do them all.