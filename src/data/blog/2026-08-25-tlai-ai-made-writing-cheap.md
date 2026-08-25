---
title: "TL;AI: AI Has Made Writing Cheap. Why Is Reading Still So Expensive?"
author: Rebecca Powell
pubDatetime: 2026-08-25T02:30:00+02:00
slug: tlai-ai-made-writing-cheap
featured: false
draft: false
tags:
  - AI
  - Communication
  - Human Factors
  - Productivity
  - Writing
description: "TL;AI is a recipient-first communication principle built from BLUF, the Pyramid Principle, SBAR, speech-act theory, progressive disclosure and AI transparency."
ogImage: "../../assets/images/tlai-human-ai-communication-og.jpg"
---

[PROPOSAL -> @Reader] TL;AI is a proposed way of structuring AI responses, built on several established principles of written communication. This article explores why that matters for effective human consumption, traceability and legal accountability, and presents the article itself in a TL;AI format. It also considers the tension with generative AI's underlying next-token prediction process, since these systems are designed to continue producing text rather than naturally stop, reconsider and restructure what they have already written.

![Human and AI communicating through a clear signal](/assets/posts/tlai/tlai-human-ai-communication.jpg)

Generative AI can produce a polished two-thousand-word memo before most people have finished explaining the problem.

That sounds like a productivity improvement. Sometimes it is. But it can also create a new kind of organisational waste: the cost of writing collapses while the cost of reading, checking, routing and responding remains stubbornly human.

AI has not removed communication cost. It has made it cheaper to move that cost onto the recipient.

That is the problem TL;AI is intended to address.

> **AI should reduce communication cost for the recipient, not merely reduce composition cost for the author.**

TL;AI is an emerging communication principle for working with generative AI. It is a synthesis of several older ideas about clear writing, structured reasoning, critical handoffs, language and attention. The contribution is not the invention of those ideas. It is bringing their most useful parts together around the new conditions created by generative AI.

## The old wisdom was already pointing here

The ingredients of TL;AI are not new. Long before generative AI, people had developed practical ways to stop important communication becoming a scavenger hunt.

### First, put the point up front

The U.S. Army's [ARMOR Writer's Guide](https://www.lineofdeparture.army.mil/Journals/Armor/Armor-Writers-Guide/) recommends putting the purpose and bottom line near the beginning of an article. The familiar name for this is BLUF: Bottom Line Up Front.

BLUF solves a basic reader problem. It stops the recipient having to excavate the reason for the message from several paragraphs of background.

The useful pattern is simple:

```text
The recommendation is to pause the migration until the rollback gap is resolved.
```

The reader can now decide whether the rest of the message is relevant. They know what the message is trying to establish before they are asked to process its supporting detail.

### Then, organise the reasoning underneath

BLUF tells us where the answer belongs. It does not, by itself, tell us how to organise everything that follows.

Barbara Minto's [Pyramid Principle](https://www.barbaraminto.com/) addresses that problem. It places a governing point at the top, then groups the supporting arguments beneath it in a logical structure. The related SCQ pattern, Situation, Complication and Question, helps explain why the issue exists and what question the communication needs to answer.

The resulting shape is something like this:

```text
governing point
  -> supporting reason 1
  -> supporting reason 2
  -> supporting reason 3
      -> evidence and detail
```

This is more than a trick for executive presentations. It reduces the amount of reconstruction the reader has to perform. The reader does not have to infer which facts belong together or decide which conclusion the author is building towards.

### When the stakes rise, structure the handoff

The [SBAR framework](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html), developed as part of the Agency for Healthcare Research and Quality's TeamSTEPPS programme, offers another useful lens. Situation, Background, Assessment and Recommendation or Request provide a compact structure for communicating information that requires attention and action.

SBAR is particularly valuable because it does not stop at describing a situation. It leads towards an assessment and makes the requested response visible.

That distinction matters in organisations. A message can contain a great deal of information without making clear what anybody is expected to do with it.

### Communication does things

Speech-act theory adds a deeper insight. Communication does not merely describe the world. It can request, recommend, warn, promise, authorise or declare.

The [Stanford Encyclopedia of Philosophy's overview of speech acts](https://plato.stanford.edu/entries/speech-acts/) traces the tradition through J. L. Austin and John Searle. Its relevance to AI communication is practical: a request, a recommendation and a decision may use similar words, but they do not have the same organisational force.

Consider the difference:

```text
Please assess the migration risk.

I recommend pausing the migration.

The authorised decision is to pause the migration.
```

These are not three ways of saying the same thing. The first asks someone to contribute. The second offers judgement. The third communicates an existing decision. Treating them as interchangeable is not a writing problem. It is a coordination problem.

### Do not show everything at once

In interface design, [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) reduces complexity by showing the primary information first and deferring secondary detail until it becomes relevant.

The same idea applies to organisational communication. A recipient should be able to stop reading when they have enough information to perform their legitimate role. They should also be able to inspect the reasoning, evidence and provenance when the consequence of the message justifies doing so.

Progressive disclosure is not concealment. It is a way of preserving access to detail without forcing every recipient to process every detail immediately.

### AI adds a transparency problem

Generative AI introduces another concern. A personable participant can appear to be a colleague while actually being artificial. A human can send text materially produced by AI. An AI participant can communicate a decision made by a human authority.

Those are different facts.

The [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) and the European Commission's [guidance on AI transparency obligations](https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations) provide important legal context for making interaction with AI systems and AI-generated content more transparent. But legal disclosure is not the whole communication model. A label saying that AI was involved does not tell the recipient whether the content is correct, verified, reviewed or authoritative.

The distinction between participant transparency and message provenance therefore matters.

## The pieces did not quite add up

Each of these ideas solves a real problem:

| Prior work             | Problem it helps solve                                               |
| ---------------------- | -------------------------------------------------------------------- |
| BLUF                   | Where should the governing point appear?                             |
| Minto and SCQ          | How should the supporting reasoning be organised?                    |
| SBAR                   | How should consequential information be handed over?                 |
| Speech-act theory      | What kind of act is the communication performing?                    |
| Progressive disclosure | How can detail be made available without overwhelming the recipient? |
| AI transparency        | How should artificial participation and provenance remain legible?   |

But generative AI changes the economics of the problem.

Before generative AI, producing a long, coherent explanation imposed a meaningful cost on the author. That cost acted as a partial brake on the amount of communication an organisation could generate.

Now a prompt can produce a plausible briefing, risk analysis, project update or meeting proposal almost instantly. The authoring bottleneck has weakened. The receiving bottleneck has not.

The result is a dangerous illusion: because communication is cheap to produce, it feels as if communication has become cheap. In reality, the work may simply have moved downstream. Someone still has to discover the conclusion, assess the evidence, find the reservations, establish who is expected to act and determine whether the apparent instruction has any authority behind it.

Generative AI makes it possible to produce more communication than an organisation can meaningfully absorb.

That is where the pieces need to be recombined.

## The token predictor and the communication protocol

To understand why TL;AI is more than a notation scheme, it helps to look at how a generative language model produces text.

A language model does not normally write a complete answer and then release it all at once. In causal language modelling, it predicts the next token in a sequence from the tokens that have already been supplied or generated. A token may be a word, part of a word or punctuation. The selected token is added to the sequence, and the model predicts the next one. This continues until a learned or externally imposed stopping condition is reached. The model can attend to the context on its left, but it cannot see future tokens that it has not yet generated. The [Hugging Face explanation of causal language modelling](https://huggingface.co/docs/transformers/en/tasks/language_modeling) provides an accessible account of this process, while the original [Transformer paper](https://arxiv.org/abs/1706.03762) describes the architecture on which many modern language models are based.

That description should not be mistaken for a claim that language models cannot reason, plan or correct themselves. Their learned representations can support surprisingly complex behaviour. But the basic generation loop does not require a distinct moment at which the system stops, inspects the whole response, checks the communicative act, reconsiders the recipient's needs and then rewrites what it has already emitted.

Stopping is not the same as reconsidering. An end-of-sequence token or a maximum-token limit tells the generator when to stop producing text. It does not tell it that the governing point has been found, that a reservation is material or that a sentence has accidentally implied authority.

This creates an important distinction for TL;AI. A model can be instructed to produce a message such as:

```text
[PROPOSAL -> @Reader] Pause the migration until the rollback gap is resolved.
```

It may do so in a single generation call. The result may even be useful. But the visible category can still be only a surface pattern. The system may label a recommendation as a proposal, omit a reservation that would change the reader's decision or imply that the sender has authority that has not been established.

TL;AI therefore pushes the communication process towards distinct stages:

```text
identify the participant, recipient and communicative act
  -> establish the governing point
  -> assemble reasons, evidence and material reservations
  -> validate authority, provenance and recipient expectations
  -> render the recipient-facing message
```

This is multi-pass in the communication sense. It does not necessarily mean five separate model calls. Some stages may be performed by one model using structured output. Others may be implemented through deterministic rules, schemas or a separate validation step. The important change is that the system creates an opportunity to reconsider the communication before presenting it to the recipient.

In a more explicit implementation, one pass could produce a candidate structure, another could fill in the supporting content, and a final pass could check whether the result has preserved the intended category, reservations and provenance. The extra work may happen inside an orchestration layer rather than inside the language model itself. TL;AI does not change the underlying model architecture. It changes the composition process around it.

Nor does this require exposing private chain-of-thought. The recipient does not need to see every internal intermediate step. They need the useful result of that work: a clear governing point, the relevant response semantics, material reservations, evidence and provenance.

This is also where TL;AI changes the economics of generative communication. If AI has made composition cheap, it can spend some of that saving on planning, checking and restructuring before a human has to read the result. The cost is paid during generation so that less unnecessary work is imposed on the recipient.

## The synthesis: TL;AI

TL;AI began as a play on TL;DR: Too Long; AI.

The joke points at a serious failure mode. If AI is used only to make composition cheaper, it can produce more text, more notifications, more summaries and more apparently thoughtful analysis without reducing the work required of the people receiving them.

TL;AI changes the optimisation target.

The author, human or artificial, should absorb more of the work required to make communication usable. That includes finding the governing point, grouping the reasoning, identifying the expected response, exposing uncertainty, connecting claims to evidence and preserving deeper material for inspection.

The recipient should receive the smallest useful surface first, with a clear path to more detail when their role or the consequence of the matter warrants it.

In practical terms, TL;AI combines:

```text
governing point
+ recipient expectation
+ target and expected actor
+ authority or obligation where material
+ structured reasoning
+ material reservations
+ evidence and provenance
+ progressive disclosure
```

The principle is not that every message needs every field. That would replace one kind of waste with another. Ordinary conversation should remain ordinary. Structure should increase when consequence, uncertainty, novelty or coordination cost increases.

## What TL;AI looks like in practice

Imagine that an artificial legal participant detects a regulatory change that may affect an organisation's planned migration.

A conventional AI-generated memo might begin with several paragraphs about the regulation, summarise its history, describe possible interpretations and eventually arrive at a recommendation. It may be beautifully written. It may even be correct. But the recipient still has to reconstruct the operational point.

A TL;AI communication begins differently:

```text
[RECOMMENDATION -> @Portfolio Owner] Pause the migration until the rollback gap is resolved.
```

The next layer explains why:

```text
The regulatory change may apply to the migrated customer-data flow.
The current rollback procedure restores the application but not the prior schema.
Proceeding would therefore exceed the accepted recovery tolerance.
```

Then the communication exposes material reservations:

```text
Material reservations

- The regulatory applicability assessment is not yet complete.
- The migration may still proceed if Legal confirms the narrower interpretation.
- The rollback gap may be resolved without changing the migration date.
```

The deeper evidence pack remains available. It does not need to be forced into the opening message.

This is BLUF, the Pyramid Principle, structured handoff, speech-act awareness and progressive disclosure working together. TL;AI gives the combination a purpose: reduce the recipient's cost of understanding and responding.

## Categories should clarify the recipient's position

Many communication labels describe what the sender is doing:

```text
[UPDATE]
[ACTION]
```

Those labels can be ambiguous. Is the sender taking action, or is the recipient expected to take action? Is an update merely informational, or does it require acknowledgement?

TL;AI favours categories that help the recipient answer:

> **What, if anything, do I need to do?**

For example:

```text
[INFO] The migration rehearsal completed successfully; no response is required.

[REQUEST -> @Data] Assess the integration implications of the proposed change.

[ACTION REQUIRED -> @Finance] Complete the control assessment by Friday under Decision D-184.

[DECISION NEEDED -> @Portfolio Owner] Choose whether to displace existing scope before committing the work.

[RECOMMENDATION] Pause the migration until the rollback gap is resolved.

[DECISION] The authorised release decision is to pause deployment until 09:00.
```

These categories do not manufacture authority.

`[REQUEST]` asks for a contribution. It does not prove assignment, capacity, acceptance or the sender's authority to direct the recipient.

`[ACTION REQUIRED]` is stronger. It should be used only when the obligation already exists under something such as a decision, role contract, accepted commitment, policy, law or contract.

`[RECOMMENDATION]` is judgement offered for consideration. `[DECISION]` communicates that an authorised decision exists. Relabelling one as the other does not make it so.

Typography cannot create organisational authority.

## `[AI]` is not the same as `TL;AI`

In a persistent collaborative environment, participant transparency usually belongs at the participant level:

```text
Holden [AI]
Legal
```

This tells people that Holden is an artificial participant. It does not pretend that a personable identity is a human identity.

The underlying system should retain structured metadata as well:

```text
identity: Holden
participant-class: artificial
role: Legal
```

The display label should not be the only place where that fact exists.

`TL;AI` has a narrower role. It is useful when AI provenance needs to travel with the content after it leaves the context that made the participant's class obvious:

```text
TL;AI [PROPOSAL] Form a bounded cross-functional discovery mission.
```

That may be appropriate in an exported report, a copied ticket, a decision pack or another detached artefact. In a live conversation where `Holden [AI]` is already clear, repeating `TL;AI` on every sentence creates visual fatigue without adding information.

Neither `[AI]` nor `TL;AI` means:

```text
correct
verified
human-reviewed
approved
authoritative
```

Those are separate questions and require separate evidence.

## The harder requirement: do not hide the reservations

Answer-first communication can become dangerous if it is interpreted as persuasion-first communication.

A fluent system can construct a convincing pyramid beneath almost any conclusion. The governing point may be clear, the reasoning may be neatly grouped and the prose may be compelling while important counter-evidence remains absent.

TL;AI therefore treats material reservations as part of the communication surface, not as an optional appendix.

If a security review is incomplete, say so near the recommendation. If the cost model depends on an unvalidated assumption, expose it. If another interpretation would change the proposed action, make that visible before the reader commits to the first conclusion.

The aim is not to make every message equally cautious or equally long. It is to stop clarity from becoming a technique for hiding uncertainty.

## What TL;AI is not

TL;AI is not a claim to have invented:

- BLUF or answer-first writing;
- the Minto Pyramid Principle or SCQ;
- SBAR or structured handoff;
- speech acts or communicative force;
- progressive disclosure;
- AI transparency or provenance requirements.

It is also not:

- a mandatory prefix on every AI-assisted sentence;
- a quality or correctness mark;
- evidence that a human reviewed the content;
- an authority token;
- permission for a system to turn a request into an obligation;
- an excuse to force routine conversation into a rigid template.

It is a principle for deciding where the work should happen. If AI has made composition cheap, it should take on more of the integration work that makes communication useful to somebody else.

## This article is an example

This article has been structured according to the principle it describes.

It starts with the governing point rather than a history of notation. It introduces the prior work before claiming a synthesis. It uses examples to make the distinctions inspectable. It puts the practical response semantics near the surface and leaves the deeper source material available for readers who want to follow it.

It also carries an explicit provenance statement because the article itself was materially developed through human-AI collaboration. The ideas, direction, editorial judgement and final responsibility are Rebecca Powell's. AI materially contributed to research synthesis, structure and drafting.

That disclosure does not establish that every sentence is correct. It tells the reader something about how the article was produced. The difference is the point.

## A principle for the generative era

Generative AI is often described as making writing cheap. That is true, but incomplete.

The more important question is who benefits from that cheapness.

If AI allows authors to produce more material while recipients must spend more time reconstructing meaning, checking claims and coordinating responses, the system has improved composition without improving communication.

TL;AI proposes a different standard:

> **The intelligence in a communication should be measured partly by how much unnecessary work it removes from the person who has to receive it.**

The best AI communication may therefore be shorter, more explicit, more inspectable and more honest about what it does not establish. It may contain fewer words while representing more work.

That is the promise of TL;AI: not merely to help AI say more, but to help people do less needless work to understand what matters and what happens next.

## Sources and influences

- [U.S. Army, ARMOR Writer's Guide](https://www.lineofdeparture.army.mil/Journals/Armor/Armor-Writers-Guide/)
- [Barbara Minto, The Minto Pyramid Principle](https://www.barbaraminto.com/)
- [Agency for Healthcare Research and Quality, SBAR](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/sbar.html)
- [Stanford Encyclopedia of Philosophy, Speech Acts](https://plato.stanford.edu/entries/speech-acts/)
- [Nielsen Norman Group, Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Regulation (EU) 2024/1689, Article 50](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)
- [European Commission, Guidelines on AI transparency obligations](https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations)
- [Hugging Face, Causal language modelling](https://huggingface.co/docs/transformers/en/tasks/language_modeling)
- [Vaswani et al., Attention Is All You Need](https://arxiv.org/abs/1706.03762)

Aided by Luna [AI]
