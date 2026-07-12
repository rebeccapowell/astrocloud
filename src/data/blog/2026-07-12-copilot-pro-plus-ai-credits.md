---
title: "Should I Leave Legacy GitHub Copilot Pro for Pro+?"
pubDatetime: 2026-07-12T21:30:00+02:00
author: rebecca
excerpt: "A detailed look at the economics of moving from GitHub Copilot's legacy annual Premium Request model to Pro+ and usage-based AI Credits, using token data extracted from Copilot CLI's own local database."
layout: "../layouts/BlogPost.astro"
slug: 2026-07-12-legacy-github-copilot-pro-vs-pro-plus-ai-credits
description: "A practical analysis of GitHub Copilot Pro versus Pro+, including Premium Requests, AI Credits, token pricing, cache usage, model selection and the hidden difficulty of comparing the two billing models."
categories:
  - technology
  - software-development
  - artificial-intelligence
---

I have spent far too long trying to answer what should have been a simple question:

Should I keep my grandfathered GitHub Copilot Pro plan at $100 per year that runs out in December 2026, or move to Copilot Pro+ at $39 per month?

At first glance, this looks like a straightforward subscription comparison. It is not. The old and new plans use fundamentally different billing models, so the headline prices tell you very little about what the same workload will actually cost. 

The legacy annual plan uses Premium Requests and fixed model multipliers. The newer plans use GitHub AI Credits calculated from actual token consumption. Input tokens, cached input, cache writes and output tokens are all priced separately, and the rate depends on the model.

That changes the economics completely.

## Why the headline price is misleading

My legacy subscription works out at:

```text
$100 / 12 = $8.33 per month
```

That sounds very cheap until metered usage is added. Recent additional charges have been around $30 to $35 per month, giving a real monthly cost of:

```text
$8.33 + $30.00 = $38.33
$8.33 + $35.00 = $43.33
```

Copilot Pro+ costs $39 per month. On that basis alone, Pro+ is already around the break-even point.

But this comparison is incomplete. The relevant question is not whether $39 is less than $38.33 or $43.33. It is whether the same workload would fit inside the AI Credits included with Pro+, or whether it would generate another substantial usage bill on top.

That is surprisingly difficult to answer from GitHub's own reports.

## Two billing models that do not translate cleanly

Under the legacy system, one model interaction is converted into a number of Premium Requests using a multiplier. A short request and a very long agentic session may consume the same number of Premium Requests if they use the same model.

Under the new system, the cost is based on the actual tokens processed:

```text
interaction cost =
    uncached input token cost
  + cached input token cost
  + cache write token cost
  + output token cost
```

GitHub then converts the dollar value into AI Credits:

```text
1 AI Credit = $0.01
```

GitHub publishes the current [per-model token prices](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing), but the legacy billing exports do not contain the token-level detail required to apply them.

The Premium Request reports show weighted requests, discounts and charges. They do not show enough information to determine what those same interactions would have cost under AI Credits.

`/usage` in Copilot CLI provides a graph. `/chronicle` offers some usage observations, but neither gave me the historical token breakdown I needed.

So I asked Copilot to interrogate its own internal database.

## Asking Copilot to inspect itself

Copilot CLI stores local session and usage information in SQLite. I asked Copilot to query `assistant.usage` events for the previous two months, group the results by `day` and `model`, and export the following columns:

- `day`
- `model`
- `input_tokens`
- `output_tokens`
- `usage_cache_read_tokens`
- `usage_cache_write_tokens`
- `uncached_input_tokens_est`
- `usage_events`

This was considerably more useful than the official billing reports.

Across the data captured by the query, the totals were approximately:

| Metric              |                Total |
| ------------------- | -------------------: |
| Usage events        |                3,464 |
| Input tokens        |          405 million |
| Output tokens       |          1.5 million |
| Cached input tokens | Hundreds of millions |

The very large input figure is not as extraordinary as it first appears. An agentic CLI repeatedly sends conversation history, repository context, tool results and instructions back to the model. Much of that context is eligible for cheaper cached-input pricing, which is why the cache columns matter so much.

Without separating cached and uncached input, any estimate is effectively useless.

## Repricing the historical model mix

Using GitHub's published token rates, I estimated what the June workload represented in the local data would have cost under AI Credits while keeping the historical model mix unchanged.

The result was approximately:

```text
12,584.6 AI Credits
```

Copilot Pro+ currently includes 7,000 AI Credits. The excess would therefore have been:

```text
12,584.6 - 7,000 = 5,584.6 billable AI Credits
```

At one cent per credit:

```text
5,584.6 x $0.01 = $55.85 additional usage
```

Adding the subscription:

```text
$39.00 + $55.85 = $94.85
```

If I migrated to Pro+ and continued using exactly the same models in exactly the same way, that historical month would have cost about $94.85.

That is clearly worse than the legacy plan.

It is also the wrong final conclusion.

## Migration changes the available models

The historical calculation assumes I would migrate to Pro+ and then carry on using the same older models. That misses one of the main reasons to migrate.

Legacy annual users do not receive access to all new models and features. The current monthly plans have a broader and actively changing model catalogue. Pro+ adds access to premium models, including GPT-5.6 Sol and Claude Fable 5, while the newer Luna and Terra options are part of the current model selection available outside the legacy annual plan. GitHub's [plan comparison](https://docs.github.com/en/copilot/get-started/plans#models) is therefore not describing the model entitlement attached to my grandfathered subscription.

The model picker on my legacy plan shows the old multiplier-based economics very clearly:

![GitHub Copilot CLI model picker showing Auto and model cost multipliers](/assets/posts/models-copilot-pro-legacy.png)

_The Copilot CLI model picker on my legacy annual plan. The values shown here are Premium Request multipliers, not AI Credit prices._

The newer GPT-5.6 family presents a more deliberate set of choices:

| Model         | Intended role in my usage strategy                         |
| ------------- | ---------------------------------------------------------- |
| GPT-5.6 Luna  | High-volume, routine work where cost and speed matter most |
| GPT-5.6 Terra | The default for substantial implementation work            |
| GPT-5.6 Sol   | Difficult work where stronger reasoning justifies the cost |

That is not the only choice. The model picker still includes older OpenAI and Anthropic models, newer Claude models such as Fable 5, and automatic model selection. Copilot CLI also supports bringing your own provider, so some workloads can be routed to a directly billed OpenAI-compatible or other supported endpoint instead of consuming GitHub AI Credits.

This creates four practical selection modes rather than one:

1. **Auto selection**, where GitHub chooses a supported model according to the task, system health and availability.
2. **A deliberately selected GitHub model**, where I choose Luna, Terra, Sol or another available model according to the work.
3. **A small model set selected by habit**, where I consciously avoid older or poor-value models even when they remain visible in the picker.
4. **BYOK**, where Copilot CLI remains the agent harness but the inference cost is billed directly by the chosen model provider.

The important change is that upgrading does not merely provide access to a better model. It provides a model portfolio. The economic case for Pro+ depends on using that portfolio intentionally rather than choosing Sol or Fable for every interaction because they are the newest names in the list.

To understand the effect of model choice, I applied the same historical token volume to each GPT-5.6 model. This deliberately ignores any reduction in tokens or agent turns, so it is a conservative comparison.

| Model         | Approximate AI Credits for the same token volume | Position against 7,000 included credits |
| ------------- | -----------------------------------------------: | --------------------------------------: |
| GPT-5.6 Luna  |                                            6,503 |                           497 remaining |
| GPT-5.6 Terra |                                           16,258 |                              9,258 over |
| GPT-5.6 Sol   |                                           32,516 |                             25,516 over |

This immediately changes the picture.

The same recorded token volume would fit inside the Pro+ allowance if most of the work moved to Luna, even before assuming that newer models complete tasks in fewer turns.

Terra would need to use roughly 57% fewer tokens than the historical workload to fit inside 7,000 credits:

```text
7,000 / 16,258 = 43.1%
```

It would therefore need to consume about 43% of the old token volume, a reduction of approximately 57%.

Sol would need a much larger reduction:

```text
7,000 / 32,516 = 21.5%
```

It would need to complete the same work using about 21.5% of the historical token volume, or approximately 78.5% fewer tokens.

That does not make Sol a bad choice. It means Sol is an expensive choice that needs to earn its place.

## Auto selection and the 10% discount

GitHub gives users on paid plans a 10% discount on model costs when Auto is used in Copilot Chat, Copilot CLI, the Copilot app or the cloud agent. Auto also attempts to match task complexity to model capability and route around models experiencing capacity problems.

That sounds like an obvious cost optimisation. It is useful, but it needs to be understood correctly.

The discount is applied to the cost of the model Auto selects. It does not make every model equally economical.

Using the same simplified historical-volume calculation:

```text
Luna via Auto:  6,503 x 90% = 5,853 AI Credits
Terra via Auto: 16,258 x 90% = 14,632 AI Credits
Sol via Auto:   32,516 x 90% = 29,264 AI Credits
```

A 10% discount on Terra or Sol is still much more expensive than deliberately selecting Luna for work Luna can complete successfully. The discount cannot compensate for a model that costs two, three or five times as much for the same token volume.

GitHub says Auto chooses only from models allowed by the subscription and applicable policies. Organization and enterprise administrators can exclude models through policy. Individual-plan users can disable evaluation models, but GitHub does not currently document a personal allow-list that lets a Pro+ user restrict Auto to a hand-picked set such as Luna, Terra and Sol.

That distinction matters. Auto becomes a stronger cost-control mechanism when its eligible pool is carefully restricted. Without that control, it is an optimisation system whose routing decisions I can inspect after the event, but not fully constrain beforehand.

GitHub does show which model handled each response, including directly in Copilot CLI. That makes Auto measurable, but it does not make it predictable.

My approach after upgrading would therefore be:

1. Select Luna, Terra and Sol manually for an initial measurement period.
2. Record AI Credits, turns and successful outcomes for representative tasks.
3. Use Auto for a comparable period and inspect which models it actually selects.
4. Keep Auto only if its 10% discount and reduced rate limiting produce a lower cost per successful task than deliberate selection.

For an organization with model policies, I would also exclude models that are both more expensive and less effective for the relevant workload. For a personal Pro+ account, where that granular restriction appears unavailable, manual selection provides the clearest cost guardrail.

## Fewer turns matter more than shorter answers

Token efficiency in an agentic CLI is not simply a matter of generating a shorter response.

A model that finds the correct files sooner, avoids unnecessary searches, makes a successful edit on the first attempt and completes the task with fewer corrective prompts can reduce costs disproportionately.

Every avoided turn also avoids another pass over an increasingly large conversation and repository context. Even where most of that input is cached, it is not free.

This is why a more capable model can sometimes be cheaper overall than a lower-priced model. Cost per million tokens is only one part of the calculation. The useful measure is closer to cost per successful task.

A model that costs twice as much per token but completes the work in one third of the turns may still be the economical option.

Unfortunately, the opposite can also happen. Selecting the most powerful model for every task can turn a predictable subscription into a substantial variable bill very quickly.

## Model selection becomes a cost-control decision

Under Premium Requests, I mostly cared about whether a model was capable and how many weighted requests it consumed.

Under AI Credits, model selection becomes a resource-allocation decision.

The question is no longer simply:

> Which model is best?

It becomes:

> Which model is capable enough to complete this task at the lowest total cost?

That is a familiar engineering problem. We do not automatically put every application on the largest virtual machine or the most expensive database tier. We choose resources according to the workload and use the more expensive option where the additional capability is justified.

A sensible Copilot Pro+ strategy would therefore make Luna the high-volume workhorse, use Terra for normal serious implementation, and select Sol for work where the additional reasoning is likely to reduce enough failed attempts or repeated turns to justify its higher token price. Fable 5 and older premium models remain available for cases where their particular behaviour is valuable, but they should not become defaults merely because they appear in the picker.

Auto may eventually improve that routing further, particularly because it receives the 10% discount and can reduce rate limiting. I would still want evidence from my own workloads before delegating model choice completely, especially while an individual account cannot define a narrow Auto allow-list.

The important point is not the exact routing policy. It is that indiscriminately selecting the strongest model defeats much of the economic value of moving to usage-based billing.

## Caveats in the calculation

This analysis is useful, but it is not a provider invoice and should not be presented as one.

First, the local SQLite database only contains what Copilot CLI retained locally and what the query discovered. It may not represent every GitHub Copilot interaction across every device or client.

Second, the export was grouped by day and model. Some OpenAI models use higher long-context rates when an individual interaction crosses a specified input threshold. Daily aggregation cannot reliably identify every interaction that crossed that boundary, so the estimate uses the standard tier where event-level reconstruction was not possible.

Third, replaying the old token volume against a new model does not account for behavioural differences. A newer model may require fewer turns and fewer tokens, or it may use more reasoning tokens on a difficult task. Only live usage after migration can provide a definitive answer.

Finally, GitHub can change model prices, plan allowances, Auto routing and model availability. The figures in this post reflect the published pricing available on 12 July 2026.

## So, is Pro+ more economical?

For someone paying only the $100 annual subscription and rarely using metered Premium Requests, probably not.

For someone already paying an additional $30 to $35 per month, the position is different. The real legacy cost is already between $38.33 and $43.33 per month, effectively the same as the Pro+ subscription.

At that point, the decision depends primarily on model selection and token efficiency.

The historical model mix would have made Pro+ considerably more expensive. A Luna-heavy workload would have fitted inside the included allowance using the same token volume. A disciplined mix of Luna, Terra and occasional Sol could plausibly remain near the $39 subscription price if the newer models reduce the number of failed turns and repeated context processing.

Auto adds another potentially useful lever through its 10% discount and capacity-aware routing. It is not, however, a substitute for understanding the model pool from which it chooses. For individual users without granular model policies, manual selection remains the safer starting point for cost control.

So my conclusion is not that Pro+ is automatically cheaper. It is that Pro+ can be more economical for a heavy user, but only when model selection is treated as part of the cost model rather than a preference in a dropdown.

## The migration report GitHub should provide

What remains odd is that customers have to do any of this themselves.

GitHub already has the information required to produce a useful migration comparison. A legacy customer should be able to see something like:

> Based on your last 60 or 90 days of activity, your workload would have consumed approximately X AI Credits under the current pricing model. On Pro+, your estimated monthly cost would have been Y.

The report could also show alternative scenarios using the currently available model families and Auto's actual historical routing decisions.

Instead, the official legacy reports expose the old billing units, while the migration decision depends on token data hidden elsewhere. I had to ask Copilot to query its own internal SQLite database to get enough information to make a reasoned estimate.

That was an interesting engineering exercise. It should not be a prerequisite for understanding the price of a subscription.
