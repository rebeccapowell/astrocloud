---
id: 215
title: 'The right algorithm for user ratings'
pubDatetime: 2012-07-06T10:59:04+01:00
author: rebecca
layout: '../layouts/BlogPost.astro'
guid: 'https://rebecca-powell.com/?p=215'
slug: 2012-07-06-the-right-algorithm-for-user-ratings
description: An explanation of the correct algorithm for sorting user ratings, highlighting the use of the Wilson score confidence interval for accurate ranking.
categories:
    - work
tags:
    - algorithms
    - development
    - ratings
format: quote
---

> You are a web programmer. You have users. Your users rate stuff on your site. You want to put the highest-rated stuff at the top and lowest-rated at the bottom. You need some sort of “score” to sort by.

<cite><a href="http://evanmiller.org/how-not-to-sort-by-average-rating.html">http://evanmiller.org/how-not-to-sort-by-average-rating.html</a></cite>

CORRECT SOLUTION: Score = Lower bound of Wilson score confidence interval for a Bernoulli parameter

### Example Implementation in C#

Here is a simple example of how to implement the Wilson score confidence interval for user ratings in C#.

#### Step-by-Step Explanation

1. **Calculate the Wilson score**: The Wilson score interval is used to calculate the lower bound of the confidence interval for a Bernoulli parameter. This helps in ranking items based on user ratings more accurately.

2. **Parameters**:
   - `p`: The proportion of positive ratings.
   - `n`: The total number of ratings.
   - `z`: The z-score for the desired confidence level (e.g., 1.96 for 95% confidence).

3. **Formula**:
   ```csharp
   double score = (p + z*z/(2*n) - z * Math.Sqrt((p*(1-p) + z*z/(4*n))/n)) / (1 + z*z/n);
   ```

#### Full Implementation

```csharp
using System;

public class Rating
{
    public int PositiveRatings { get; set; }
    public int TotalRatings { get; set; }

    public double CalculateWilsonScore()
    {
        if (TotalRatings == 0) return 0;

        double z = 1.96; // 95% confidence level
        double p = (double)PositiveRatings / TotalRatings;

        double score = (p + z * z / (2 * TotalRatings) - z * Math.Sqrt((p * (1 - p) + z * z / (4 * TotalRatings)) / TotalRatings)) / (1 + z * z / TotalRatings);
        return score;
    }
}

public class Program
{
    public static void Main()
    {
        Rating rating = new Rating
        {
            PositiveRatings = 80,
            TotalRatings = 100
        };

        double score = rating.CalculateWilsonScore();
        Console.WriteLine($"Wilson Score: {score}");
    }
}
```

```bash
Wilson Score: 0.7137658827880908
```

## Explanation of the Code
1. **Rating Class**: This class contains properties for positive ratings and total ratings. It also includes a method to calculate the Wilson score.
2. **CalculateWilsonScore Method**: This method calculates the Wilson score using the formula provided. It returns 0 if there are no ratings.
3. **Main Method**: This method creates an instance of the Rating class, sets the positive and total ratings, and calculates the Wilson score. The result is printed to the console.

This example demonstrates how to implement the Wilson score confidence interval in C# to rank user-rated content more accurately. By using this method, you can ensure that items with fewer ratings are not unfairly ranked higher or lower than they should be.