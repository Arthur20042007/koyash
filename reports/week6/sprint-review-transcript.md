# Week 6 Sprint Review — Transcript

**Date:** 2026-07-11
**Participants:** Team, Customer
**Scope:** Sprint 4 review, Week 6 trial walkthrough, customer-executed trial, customer-facing documentation review, and transition-readiness discussion (one recorded meeting covering Sprint Review + UAT + transition, per Assignment 6 Part 9.4 / 10.8).

> Cleaned for readability and translated to English from the recording; meaning preserved.
> Personal data is removed; one brief off-record business matter is marked `[redacted]` at
> the customer's request. Timestamps are approximate.

---

[00:00]
Team: So — we've built the account, the saved cosmetic bag, and the tracker. The interface is still a bit rough in places; we didn't quite finish it and will polish it by the end of the week. This is the personal cabinet. It already has a saved cosmetic bag, and you can re-take the questionnaire. Let's re-take it now — a new bag will be saved.

[01:05]
Customer: Oh, you added an age limit.

[01:10]
Team: Yes, from 10 to 100.

[01:20]
Customer: Can I find out my skin type? Ah, I see it.

[01:35]
Team: Here's the bag we got — it's saved in the personal cabinet. You can leave feedback on each product: "worked" / "didn't work", with a comment box. If a product didn't work, you can replace it. Here we choose a replacement. The product is updated, and the one that didn't work moves to the bottom, keeping its comment. And here is the result tracker — let me make it available, because it doesn't open until two weeks have passed.

[02:40]
[Approximately five minutes: the team walks the customer through the visual design of the account screens. The customer reacts positively throughout — "great", "that's lovely", "I really like it".]

[07:45]
Customer: The design is very pleasant, I'm happy with it. I'm not sure what else to add. Did you send me the logo?

[08:00]
Team: Yes.

[08:05]
Customer: Could you send it to me as a square.

[08:20]
Team: So there are no more fixes, right?

[08:25]
Customer: No — only to think about the criteria in the tracker.

[08:40]
Team: We've actually already done that — see. Whatever problems and skin type you marked in the questionnaire are what's shown. If there are no problems, there's a base set of criteria. You can give an overall rating with a comment. And here the statistics are shown — the tracker for week 4 and so on will open later.

[09:35]
Customer: Great.

[09:40]
Team: This will look better once finished.

[09:45]
Customer: Well, if you make it like in the design, it'll all be good.

[09:55]
Team: Yes, of course we will. In the personal cabinet the user can change the password and delete the account. One more question about "forgot password": should we build it? It needs a service to send an email.

[10:30]
Customer: I have a mail domain, and a mail service is already connected to it. So we could do something like noreply@… I can give you all the credentials for it — let's try.

[11:05]
Team: Let's do it.

[11:10]
Customer: Then please remind me.

[11:20]
Team: Another question — what should happen when the 12 weeks of the tracker are over? What next?

[11:35]
Customer: I'm still thinking about that. It's probably beyond the scope of this project; more functionality may be added there.

[12:05]
[redacted — a brief off-record business matter, not for publication at the customer's request.]

[12:45]
Team: They also require a documentation review. This describes what we're handing over — the project, the links, deployment, the database.

[13:15]
Customer: Yes, it all looks fine. One recommendation: move the repository to GitHub.

[13:25]
Team: It's already on GitHub.

[13:30]
Customer: Oh — GitHub, not GitLab?

[13:35]
Team: Yes.

[13:40]
Customer: Then you can share it with me by link as well.

[13:55]
Team: Now some questions about the handover. In your view, how complete is the product — is it complete enough to be handed over?

[14:15]
Customer: Finish the frontend now and it's all great.

[14:30]
Team: Are you already using the product?

[14:35]
Customer: No.

[14:40]
Team: If not, why not?

[14:45]
Customer: Well — this product isn't so much for me as for other users. And it is a brand, after all; it needs more work.

[15:15]
Team: Have you tried the version yourself?

[15:20]
Customer: Yes.

[15:30]
Team: Is the product deployed or operated on your side?

[15:35]
Customer: Not yet.

[15:50]
Team: We also had an idea to send tracker reminders by email.

[16:00]
Customer: Let's say it's already accounted for — there will be a Telegram bot for that.

[16:25]
Team: Good. We also had a user story from the start: if a product contains a potential irritant — not an allergen exactly, but something that could theoretically irritate the skin — we warn the user. I thought this would be tied to the LLM: it analyses the composition and gives an answer. Do we need to do this — change the prompt somehow?

[17:10]
Customer: Write to me, we'll add it to the prompt and experiment with it too.

[17:35]
Team: That seems to be everything. We'll finish so the design looks good.

[17:50]
Customer: Great, I'm very glad.

[18:00]
[End of recording.]
