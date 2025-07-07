---
id: 10001
title: "The Robotic Rubber duck - coding an energy forecasting engine with OpenAI Codex"
pubDatetime: 2025-07-18T00:11:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=10000"
slug: 2025-07-08-the-robotic-rubber-duck-coding-an-energy-forecasting-engine-with-openai-codex
description: An adventure coding without coding.
featured: true
draft: false
categories:
  - work
tags:
  - dotnet
  - aspire
  - temporal
  - energy
  - strom
  - electricity
  - forecasting
  - graphing
  - SLP
  - Standard Load Profiles
  - BDEW
  - ENE't
---

![codex bdew import](/assets/posts/codex-robotic-rubber-duck.png)

## Introduction

Did you know that programmers have a pattern called [rubber duck debugging](https://en.wikipedia.org/wiki/Rubber_duck_debugging)? It's as simple as it sounds. You take a common bathtub rubber duck and place it on your desk. Whenever you hit an impasss or problem, you start talking to your rubber duck, explaining the problem. Many programmers will have tried something similar with their colleagues at work. You start to explain the problem and then 90% of the time you realize the solution to the problem yourself. The rubber duck replaces the human when you haven't got a peer, or your peers are busy. Explaining the problem normally leads you to solve the problem yourself.

Robotic Rubber Duck programming takes that a step further. The development of AI dev tools has exploded over the past two years. Whilst we started off with simple changes in a single file context as with Github Copilot when it started, this has grown to support building entire apps with tools like Cursor and Windsurf. Now OpenAI Codex, available to anyone with an OpenAI Pro license, can write, build, and test the code, and create a pull request in your code repository. All you need to do is review the code and merge the PR. Almost...

I recently put this to the test. The challenge I set myself was to build a energy forecasting API first application. No UI, just an API. I'm scratching an itch. My work colleagues will understand why.

**Quick Disclaimer**: _This work is a personal endeavour and done outside of my work. It has no connection to my employer and all views and code are written by OpenAI Codex._

## What does an energy forecasting engine do?

Energy suppliers sell electricity contracts (let's ignore gas for the moment) to their customers. As you can imagine, every customer is different, but in general they follow well-defined daily and seasonal patterns called standard load profiles (Let's ignore RLM's for the moment). Customers have an estimated annual consumption, and the vast majority of customers have these simple meters in Germany. The smart meter roll out isn't going so well here, but that's another story.

### Standard Load Profiles

Standard Load Profiles (Standardlastprofile - SLP) meters record your energy usage. Anyone that has given their supplier a meter reading has probably at some time descended into their basement to look at the little counter on the meter device to read it and send it to the electricity company once a year. These SLP meters are paired with standard load profiles that match the customer's usage. 

This matters because some customer's have very different usage patterns to others, and for the energy suppliers, that's important to take into account in understanding what energy the customer will use and when. When pricing contracts to customers, especially in a B2B context, this forecast becomes important the larger the usage in total kWh. A bakery for example has high usage in the morning when the ovens are on, dropping down around lunchtime and tapering off in the evening when the bakery shuts. A household is traditionally very different, especially pre-COVID when remote work wasn't so common, household got up, turned the kettle on, had breakfast and then went to work for the day, until they came home again in the evening. All these factors are compounded by the seasons as well. Winter when it is dark and colder, more energy is consumed in comparison to the summer when it's light much longer and people are out of the house enjoying the weather.

There are a number of defined standard load profiles active in the German market. For about the last 20 years the VDEW (now BDEW since 2007) has analyzed and aggregated usages across the German market to provide a number of standard load profiles so that all parties in the energy market have an agreed understanding of a customer's energy usage, depending on which profile is assigned. These have remained as the defacto standard for twenty years:

| Type   | Description                           | Explanation                                                                                                                                                              |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **G0** | General commercial                    | Weighted average of the individual commercial profiles G1–G6, representing an overall “general business” consumption pattern                     |
| **G1** | Commercial, weekdays 08:00–18:00      | Typical office-type profile (e.g. offices, medical practices, workshops, administrative facilities) with load during standard business hours     |
| **G2** | Commercial with peak in evening hours | Businesses with significant evening activity (e.g. sports clubs, fitness studios, evening-opening restaurants)                                  |
| **G3** | Continuous-load commercial            | Operations running around the clock (e.g. cold storage, pumps, wastewater treatment plants)                                                       |
| **G4** | Retail / hairdressers                 | Load profile for small retail shops and hair salons with midday peaks and Saturday activity                                                       |
| **G5** | Bakery with bakehouse                 | Bakery operations including early-morning baking loads combined with daytime sales activity                                                       |
| **G6** | Weekend-only operation                | Businesses operating primarily on weekends (e.g. cinemas, leisure venues)                                                                         |
| **G7** | Mobile-phone base station             | Flat, continuous “band” profile typical of a telecommunications transmitter site                                                                  |
| **L0** | General agriculture                   | Weighted average of agricultural profiles L1 and L2, representing “average farm” consumption                                                      |
| **L1** | Dairy / secondary-livestock farms     | Farms with dairy production or part-time animal husbandry resulting in distinctive morning and evening load peaks                                 |
| **L2** | Other agricultural businesses         | Agricultural enterprises without significant dairy or livestock operations, e.g. crop-only farms                                                  |
| **H0** | Household                             | Typical residential consumption profile (without electric heating), showing morning and evening peaks and a dynamic seasonal adjustment function  |
                                         
> Note that the H0 needs a dynamization (Seasonal) function applied.

As of 2025, they published a new set, which simplfies that list:

| Type    | Description                        | Explanation                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **H25** | Updated household profile          | A top-down profile derived from 2018–2019 balancing data of 62 distribution network operators, inherently incorporating moderate prosumer (e.g. PV self-consumption) effects. This profile is “de-dynamized,” so you must apply the prescribed dynamization function to recreate the typical annual curve (rounded to 4 decimal places, then results rounded to 3 decimals).  |
| **G25** | Updated commercial profile         | A single, unified profile for all commercial customers, based on \~2,000 smart-meter time series from 2022–2023 across ten network operators. No dynamization applies or is needed.                                                                                                                                                                                           |
| **L25** | Updated agriculture profile        | A single agriculture profile based on the old VDEW L0 profile (no new measurement data available). No dynamization applies or is needed.                                                                                                                                                                                                                                      |
| **P25** | New PV-combination profile         | Represents the impact of PV generation on a household connection, derived from 400 smart-meter series (2022–2023). This profile is de-dynamized, so the dynamization function must be applied. Note: it reflects average solar radiation and carries weather-dependency risks.                                                                                                |
| **S25** | New PV-storage combination profile | Reflects the combined effect of PV plus storage on household consumption, based on 200 smart-meter series (2022–2023). Also de-dynamized—apply the dynamization function. Like P25, it carries weather-dependency risks.                                                                                                                                                      |

In summary:

**1999 Publications** [cran.r-project.org](https://cran.r-project.org/web/packages/standardlastprofile/standardlastprofile.pdf)

|Type|First Published|Purpose|
|---|---|---|
|**H0**|1999|To provide a representative residential consumption pattern for non-metered households, enabling proxy billing, network planning, and demand forecasting.|
|**G0–G7**|1999|To standardize commercial load shapes across diverse business types—offices, retail, industry, etc.—so utilities can forecast demand, design tariffs, and size infrastructure.|
|**L0–L2**|1999|To capture typical agricultural consumption (dairy farms, crop-only farms) in unified profiles, supporting rural network balancing and settlement for non-interval-metered customers.|

**2025 Publications** [flrd.r-universe.dev](https://flrd.r-universe.dev/standardlastprofile/standardlastprofile.pdf)

|Type|First Published|Purpose|
|---|---|---|
|**H25**|April 27, 2025|Updated household profile using 2018–2019 balancing data (62 DNOs), incorporating prosumer effects; delivered “de-dynamized” for users to apply the prescribed dynamization function.|
|**G25**|April 27, 2025|Unified commercial profile based on ~2,000 smart-meter time series (2022–2023) across ten network operators, replacing the seven legacy G-profiles with a single, high-resolution shape.|
|**L25**|April 27, 2025|Refreshed agriculture profile (no new measurement data available), aligning with the legacy VDEW L0 structure; provided without dynamization.|
|**P25**|April 27, 2025|New PV-combination profile derived from 400 smart-meter time series (2022–2023), “de-dynamized” to let users reconstruct weather-dependent annual curves; captures average solar self-generation impacts on household connections.|
|**S25**|April 27, 2025|New PV-storage combination profile based on 200 smart-meter series (2022–2023), de-dynamized; represents combined PV generation plus battery dispatch effects on household load.|

**Why these publications were made**

- **1999 launch**: The original VDEW (now BDEW since 2007) profiles were published to fill a critical gap for utilities and grid operators lacking interval-metered data. By supplying representative quarter-hourly consumption shapes for households, businesses, and farms, the 1999 release enabled standardized proxy billing, more accurate demand forecasting, tariff design, and efficient network planning across Germany. [cran.r-project.org](https://cran.r-project.org/web/packages/standardlastprofile/standardlastprofile.pdf)
    
- **2025 update**: The energy landscape has evolved with widespread smart-meter rollout, prosumer installations (PV and storage), and richer balancing-circle data. The 2025 revision modernizes the profiles—leveraging recent multi-year data—to better reflect current consumption patterns (including self-consumption and storage dispatch), simplify legacy categories, and support the energy transition with higher-fidelity load modeling. [flrd.r-universe.dev](https://flrd.r-universe.dev/standardlastprofile/standardlastprofile.pdf)

### Forecasting Electricity Consumption with Standard Load Profiles, Annual Usage & Contract Duration

Electricity retailers and network operators often need to predict future consumption for billing, procurement, and network planning. A simple yet effective method combines three pieces of information:

- A Standard Load Profile (SLP) – a typical normalized daily/weekly consumption shape
- Annual Consumption – the total expected energy usage over a year (e.g., 12 000 kWh)
- Contract Duration – the period for which to forecast (e.g., January 1–June 30)

Below, we’ll walk through how these inputs yield a time-series forecast, then explore why accounting for holidays—particularly in Germany where public holidays vary by state—is crucial. We’ll wrap up with a straightforward C# algorithm illustrating the approach.

1. From Annual Consumption & SLP to Time-Series Forecast
**Normalize the SLP**
Each SLP (e.g. H0 household profile) provides 96 quarter-hour factors per day and profiles for different day-types (workday, Saturday, Sunday). These factors sum to 1.0×365 (or approximately so) over the year.

**Scale to Annual Usage**
Multiply each SLP factor by the target annual consumption, then divide by the total sum of factors in the period of interest.

```text
scaled_value[t] = slp_factor[t] 
                  × (annualConsumption kWh) 
                  / (sum of slp_factors over contract period)
```

This yields forecasted `kWh` for each interval `t`.

**Trim to Contract Period**
Only include intervals within the contract start and end dates. If the period crosses seasons or day-types, pull the appropriate SLP segments.

2. Why Holidays Matter
Standard load profiles distinguish only between weekdays, Saturdays, and Sundays. Yet, public holidays often exhibit consumption patterns closer to Sundays (lower industrial/office loads) or even unique behaviors (e.g., Christmas Eve). Ignoring them can lead to:

- Over-forecasting on holidays that behave like Sundays
- Under-forecasting on holiday eves or high-activity days

Especially for shorter contract durations, misclassifying 5–10 holidays can skew volume commitments and imbalance costs.

3. German Holidays: State-Level Variations
Germany’s federal structure means each of its 16 states (“Bundesländer”) observes a distinct set of public holidays. For example:

 - Karneval Monday is a holiday in Rhineland-Palatinate and North Rhine-Westphalia, but not in Bavaria.
 - Epiphany (Jan 6) is only in Baden-Württemberg, Bavaria, and Saxony-Anhalt.
 - Reformation Day (Oct 31) applies in Brandenburg, Mecklenburg-West Pomerania, Saxony, Saxony-Anhalt, and parts of Schleswig-Holstein.

**Why this matters**:

When forecasting for a customer in Bavaria, you must treat Jan 6 and All Saints’ Day (Nov 1) as holidays (use the Sunday profile), whereas in Berlin they are normal workdays. Failing to adjust for state-specific holidays can introduce systematic bias into your forecasts and contractual positions.

4. Simple C# Algorithm
Below is a minimal C# example illustrating these steps. It:

- Loads an SLP as a dictionary of <DateTime, double> factors
- Iterates through the contract period
- Checks if each date is a weekend or holiday (per state)
- Applies the correct factor and scales it

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

public class LoadForecaster
{
    // Example method to check German holidays per state
    static bool IsHoliday(DateTime date, string state)
    {
        var holidays = new HashSet<DateTime>();

        // Common nationwide holidays
        holidays.Add(new DateTime(date.Year, 1, 1));   // New Year
        holidays.Add(new DateTime(date.Year, 10, 3));  // German Unity Day
        // ... add other nationwide

        // State-specific example
        if (state == "Bavaria")
        {
            holidays.Add(new DateTime(date.Year, 1, 6));  // Epiphany
            holidays.Add(new DateTime(date.Year, 11, 1)); // All Saints' Day
        }
        // Add other states similarly...
        
        return holidays.Contains(date.Date);
    }

    public static Dictionary<DateTime, double> Forecast(
        Dictionary<DateTime, double> slp, 
        double annualConsumption, 
        DateTime start, 
        DateTime end,
        string state)
    {
        // Filter SLP to period, classify day types
        var periodFactors = new List<double>();
        var entries = new List<DateTime>();

        for (var day = start.Date; day <= end.Date; day = day.AddDays(1))
        {
            bool holiday = IsHoliday(day, state);
            bool isWeekend = day.DayOfWeek == DayOfWeek.Saturday 
                             || day.DayOfWeek == DayOfWeek.Sunday;
            string dayType = holiday || isWeekend ? "Sunday" : "Workday";

            // 96 intervals per day
            for (int i = 0; i < 96; i++)
            {
                // Build datetime for each quarter
                var dt = day.AddMinutes(15 * i);
                // Key format in SLP: e.g. "Workday_0:15"
                string key = $"{dayType}_{dt:HH:mm}";
                
                if (slp.TryGetValue(dt, out double factor))
                {
                    periodFactors.Add(factor);
                    entries.Add(dt);
                }
                else
                {
                    throw new Exception($"SLP missing factor for {key}");
                }
            }
        }

        double factorSum = periodFactors.Sum();
        double scale = annualConsumption / factorSum;

        // Apply scaling
        var forecast = new Dictionary<DateTime, double>();
        for (int i = 0; i < entries.Count; i++)
        {
            forecast[entries[i]] = periodFactors[i] * scale;
        }
        return forecast;
    }
}
```

#### How it works:

- Holiday Detection – IsHoliday builds a set of date-only holidays, including nationwide and state-specific ones.
- Day-Type Classification – Each date is labeled as “Workday”, "Saturday" or “Feiertag” (covering weekends & holidays).
- Factor Aggregation – Collect all quarter-hour factors from the SLP for the period.
- Scaling – Sum of factors is used to derive a scaling coefficient so the total forecast matches the annual consumption.
- Output – A time-series dictionary mapping each timestamp to forecasted kWh.

By marrying a normalized SLP with your desired annual consumption and precisely accounting for weekends and state-specific holidays, you can generate accurate, interval-level forecasts. This approach balances simplicity with the granularity needed for modern energy trading and network management in Germany’s federal holiday landscape.

## Coding this using Codex

You need to connect Codex to your Github account. You can be selective as to which repositories it can access. You'll find Codex in you ChatGPT account in the left hand navigation.

Once Codex and Github are connected you'll need to setup a Codex environment. This maps the Github repo with a collection of settings and rules.

![codex environment 1](/assets/posts/codex-environment-1.png)

There are standard packages pre-installed, but these don't include dotnet. Hopefully that will come soon.

![codex environment 2](/assets/posts/codex-env-2.png)

If you want agentic access, you can carefully enable it here. Be warned that you should be careful what you let the agent access, as it could lead to third party exploits.

![codex standard packages](/assets/posts/codex-env-3.png)

Notice the setup script. If you want to install .NET (this is a Linux environment), you can use the following:

```bash
curl -sSL https://dot.net/v1/dotnet-install.sh | bash /dev/stdin --channel 9.0
```

Another way to do this is to create an AGENTS.MD file in your repository root. This tells the agent what to do in your repo and guidelines on how to approach working in your repo. I created a simple one like this, to make sure it knew how to install the depednecies and how I preferred it to manage dotnet solutions and projects.

![codex standard packages](/assets/posts/codex-agents-md.png)

Then you can get started with prompting the Codex what it should do. You can just use `Ask` to find out information about a repo, or `Code` to actually make changes. I'll come back to this style of prompting later.

![codex standard packages](/assets/posts/codex-specification-driven-development.png)

You can click on a task and follow it's process through via the logs. As a side note, you can learn a lot about command line mastery from watching this, especially `git` and other bash command line tools like `grep` and `sed`.

![codex standard packages](/assets/posts/codex-code-task-logs.png)

When the code has build and been tested, Codex will automatically create a new branch and a pull request for you to review. It's up to you to review the change in place, or to clone the branch and run it locally to check what the code is doing.

### Lessons learned

My first attempts using Codex were not very successful. I soon realized that simple prompts were not good enough. As the old adage goes "garbage in, garbage out".

#### The agent instructions manual
The AGENTS.MD file grew because I noticed that the Codex agent approaches development in an "agentic" manner. So for example, .NET solution files (old style) are a horrific mix of project links, build configuarations and project type and project GUID's. There are standard dotnet commands to create a solution, create a project or add a project to a solution, but the Codex agent took another approach. It saw GUID's installed a GUID generator tool and hand generated those GUID's and the solution file "by hand". I therefore have an instruction to Codex to do this in the manner I would prefer, as it is less error prone.

#### Prompting
Prompting with Codex is actually hard to get right ad-hoc because I realized you needed to remove ambiguity. Over time I realized that I needed to go a bit old-school. Twenty years ago I spent a lot of time writing documents such as Specification of Work (SoW), Software Requirement Specifications (SRS) and Functional Requirements Documents (FRD) for preentation to clients for waterfall projects.

I decided to go back to my roots in describing feature additions in the same manner. I would iterate around a specification with ChatGPT. I'd describe the problem I wanted to solve, and using the canvas feature I'd create a specification of work in markdown format.

![codex standard packages](/assets/posts/codex-detailed-specifications.png)

As a rough guide, you want to specify:

 - Statement of the change, including my favourite:
   - what?
   - why?
   - how?
   - constraints!
 - Data models, including the various tables, columns, data types, descriptions of usage, and keys (PK, FK, UK)
 - API endpoints and endpoint groups
 - Example requests and responses
 - Focus of the change
 - Areas of impact (in the application)

When that was finished I'd upload it to my `specification` folder in the repo and point Codex at it.

#### Giving Codex a starter kit
I decided to write the first part of the code myself. I wanted to give Codex a guideline for what my coding style was like and how I liked my code to look. So far it has generally followed those architectural structures and coding styles.

#### Small PR's work best
I've noticed that it's easier to keep PR's small. Don't try and do too much at once. As with human developers, large PR's are hard to manage and for a reviewer, hard to review.

It's also important to let Codex know that a change being made might require refactoring in another area, otherwise it might miss it.

#### Sourcing data examples
Unlike ChatGPT you cannot upload files directly to the agent. It only works within the context of the repo, so if you need to provide it sample data or other reference material, you'll probably want to upload that too, and then reference it in your specifications.

For example, in this forecasting usecase I needed to download the `Standard Load Profile` Excel files from the [BDEW website](https://www.bdew.de/energie/standardlastprofile-strom/). For ENE't they provide [sample data files](https://www.enet.eu/downloads/) in `CSV`, `CSV-5J`, `MSSQL` and `ORACLE`. Or for weather from [open data sources](https://opendata.dwd.de/climate_environment/CDC/help/landing_pages/doi_landingpage_TRY_Basis_v001.html).

Adding them into a `SampleData` folder in the repo allows Codex to look at that data and figfure out how to deal with it, since much of this needs to be imported into a database to be useful.

#### App Walkthrough (Forecasting)
I focused on building an API and not a UI. I wanted to focus on the engine and not the chassis. The first requirement was to figure out how to import the BDEW SLP profiles mentioned above. I  needed to support two slightly different formats. Note: ENE't has another format as well, which I noticed in their sample data, but I've ignored it for now.

The first step is to upload the BDEW SLP Excel file. I explicitly tell it whether it is the older v1999 profiles in this case, rather than the v2025 version. I give the profile a `prefix`. This would allow an energy supplier the opportunity to tweak their own versions of these profiles if they want when forecasting.

![codex bdew import](/assets/posts/codex-app-import-bdew-1999.png)

This kicks off a Temporal process to import the profiles.

![codex bdew import](/assets/posts/codex-app-temporal-bdew-import.png)

With the BDEW SLP profiles installed, we can look at what a specific SLP actually looks like, which highlughts the differences between the different times of the day for a specific profile:

![codex bdew import](/assets/posts/codex-app-api-slp-curves-result.png)

Or alternatively we can view this as a heatmap:

![codex bdew import](/assets/posts/codex-app-api-slp-g2-heatmap.png)

Now we want to roll out a specific profile. I choose a default of 5 years from the rollout date, but you'd probably want to let the client specify the maximum runtime. This means it will work through each timeseries datapoint and expand it out over the full year, taking into account the holidays for each Bundesland. 

![codex bdew import](/assets/posts/codex-app-api-rollout-bdew-g2.png)

We end up with a highly optimized a `Redis` cached profile for each state (Bundesland) for the profile that we rolled out. This will help us later when we create a meter in a specific Bundesland. There is also a side line into time of day for High Tariff vs Low Tariff (HT vs NT) in the German market and each Netz can have a different opinion on when that switch happens in the day (you got to love the "flexibility" - snark):

![codex bdew import](/assets/posts/codex-app-temporal-rolledout-5-years-per-state.png)

With that we can view graph for that rolled out SLP for a specific year and state:

![codex bdew import](/assets/posts/codex-app-api-rolledout-g2-hb-heatmap.png)

![codex bdew import](/assets/posts/codex-app-api-slp-g2-hb-heatmap-result.png)

With that in place we can create an offer structure, and in this case I'm only going to add one meter, but it can forecast multiple meters and groups of meters and produce aggregated results:

![codex bdew import](/assets/posts/codex-app-api-api-offer-create.png)

Now we have to request a forecast of that offer, but I could have chosen to automatically forecast (and calculate) when the offer is created, but for illustration purposes I'll choose the granular route:

![codex bdew import](/assets/posts/codex-app-api-offer-forecast.png)

We can follow that forecasting through over in Temporal:

![codex bdew import](/assets/posts/codex-app-temporal-offer-forecast-rollout.png)

Now I can request the forecast results:

![codex bdew import](/assets/posts/codex-app-api-forecast-result-request.png)

And get those results either as an API JSON response or as Excel:

![codex bdew import](/assets/posts/codex-app-api-offer-forecast-result.png)

Now I can also request to graph that data:

![codex bdew import](/assets/posts/codex-app-api-offer-forecast-results-graph.png)

In multiple ways:

![codex bdew import](/assets/posts/codex-app-api-offer-forecast-result-graph-output.png)

![codex bdew import](/assets/posts/codex-app-api-offer-forecast-graph-smoothed.png)

### Development flow
Since I have a very busy full-time job I've been limited to developing this in the evenings and on weekends when I have time and the children have gone to bed. The nice thing about this is that after I've written the specification, I kick Codex off and go back to enjoying my weekend, coming back to review the changes when it's finished. The ChatGPT app has Codex live activities on iOS, so I can be notified when it's done and return from watching Netflix or doing the washing up to see how it got on.

### Conclusion
This has been a fun dive in to the ~~vibe coding~~ agentic development world using OpenAI Codex. I actually have gone further than I had set out to achieve. My key goals were to understand agentic development flows, get a better understanding of how forecasting and price calculations work in the German energy market, and to do some coding again, since I don't get time during work as a team lead with disciplinary responsibility for two agile tech teams. 

I wouldn't call this a polished product by any means, but it is functional as a quick and dirty MVP. As the application gets bigger I notice that Codex is starting to struggle. I wondering if the context windows is now reaching a breaking point.

If you have any feedback then please let me know. I'd love to hear your thoughts.


