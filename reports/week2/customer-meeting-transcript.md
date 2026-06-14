# Customer Meeting Transcript - Week 2

(00:00)
Team: First we'd like to get your consent. We'll be developing the project openly, in a public repository under the MIT license. Can you confirm that you agree to that?

(00:24)
Customer: Yes.
 
(00:25)
Team: We also need to obtain your statement of consent for the assignment. We're not sure what format that should take, honestly.
 
(00:28)
Customer: Can you show me the assignment text? Then I'll understand what they want.
 
(00:44)
Team: It says written consent is required, but there's no template document provided.
 
(01:13)
Customer: Is this actually mandatory? By what date?
 
(01:35)
Team: By the end of the week, Sunday.
 
(01:38)
Team: We just don't understand what written format this is supposed to be.
 
(01:40)
Customer: I'll ask [redacted] (instructor) myself, then. Can you send me a screenshot?
 
(02:24)
Team: Yes. Also we organized the main requirements as user stories and assigned priorities — what's mandatory, what's desirable, and what we won't do. Can you confirm that you approve them?
 
(02:52)
Customer: Good job. One second — let me pull it up.
 
(03:18)
Customer: The second story I'd like to redo. I'm not quite following it, to be honest. It reads: "I want to answer the questions about my skin and preferences in a warm narrative flow rather than a dry form, so that I provide data for a good recommendation." I don't see how answering questions in a narrative flow connects to providing data for a good recommendation.
 
(03:48)
Team: The point is that our questionnaire will be in a story format — that's this part.
 
(03:49)
Customer: Yes, but that doesn't affect the quality of the recommendation. Even if it were just a plain questionnaire, a good recommendation should still be produced. Those two things aren't really connected. It's more about the last part — not feeling like you're being interrogated or pressured, i.e. not the format of an ordinary form.
 
(04:23)
Customer: So phrase it like: "As a user overwhelmed by choice, I want to answer questions about my skin in a narrative flow so that I don't feel like I'm being interrogated or under pressure." Keep the recommendation point separate.
 
(04:40)
Customer: Now the third story. "I want to set my budget by choosing a segment instead of entering an arbitrary amount, so the system can reliably filter." "Reliably" doesn't quite fit here — better: "so it can filter according to my needs."
 
(05:09)
Customer: The fourth one can also be strengthened with the idea of the real catalog. If you ask an LLM for a set of cosmetics, it starts hallucinating and returning products that don't exist. We should emphasize selecting from the real catalog so it doesn't output non-existent products.
 
(05:58)
Customer: The fifth — "As a user overwhelmed by choice, I want each product to come with a brief explanation of why it was chosen for me, so that I understand and trust the recommendation rather than just being told to buy it." So when the user receives the cosmetic bag, each product carries an explanation — what it's for, why. That part is clear. The real question is whether the user actually wants this. If we're talking about trust, the emphasis should be on understanding and trust. I'd reframe this one.
 
(06:55)
Customer: The fifth again — let's emphasize that the user understands and trusts the recommendation, not just receives an instruction to buy. Reformat it differently.
 
(08:25)
Customer: For the seventh, the framing shouldn't be "overwhelmed by choice" — it should be something else. Someone who cares about veganism or animal welfare isn't necessarily overwhelmed by choice; for them it's a values question. So the emphasis here should be different.
 
(09:26)
Customer: The ninth — that's a Must. 

(09:30)
Team: And about skin type: it's just not in the database yet. So we mark it as a "should." 

(10:00)
Customer: If anyone has free time they can fill in skin type — there are 69 entries; you just open the link and check the skin type for each. That would be great to have.
 
(10:20)
Customer: On product categories and photos — we discussed photos last meeting. If they're integrated nicely, fine, but does the user really want a photo per product? Worth questioning.
 
(11:00)
Customer: "Returning user" — I don't love the wording, but it's okay in principle.
 
(11:20)
Customer: I'd also rephrase the fourteenth. "The user doesn't know how the selection is generated" isn't very important to them. What matters most is: explain to me why this is recommended, why I should use exactly this. So reframe it with the emphasis on that value.
 
(11:49)
Team: As you know, we'd like the product to give not just a list but deeper help.
 
(12:16)
Customer: 17-18 — yes, but that's beyond the scope of this project.
 
(12:17)
Customer: So MVP stories one through eight 
 
(12:18)
Team: Yes, those are all Musts.
 
(12:18)
Customer: Wait — isn't the MVP due next week?
 
(12:19)
Team: MVP version one — how many versions do we have?
 
(12:21)
Customer: The MVP should already be a working version as far as I know, but check with [redacted] (instructor) to be sure. For the first MVP version, though, you don't really need the landing page.
 
(12:45)
Customer: Do you have a board where you assign tasks to each other — an actual task tracker, like Confluence or Jira? We just integrated an interesting service today — a task-management tool called [inaudible]. It also has a wiki. Try adopting a task tracker and mark there what's a priority and what isn't. Who's the project lead here — who tracks the tasks?
 
(13:14)
Team: Me, basically.
 
(13:16)
Customer: Great — then that's your responsibility. Over the weekend, if you have time, learn how to set up a nice board: To Do, In Progress, Review, Done. What you bring to me later goes through that. It's very useful experience, a must for the MVP.
 
(13:45)
Customer: On the MVP version one — it looks like a bit too much. Better to do one basic but high-quality flow that you can adapt later — like the landing. The frontend doesn't need to build the fancy parts right away, since that's not the core functionality. You need basic filtering, a basic output, and the questionnaire. You can prepare a couple of story versions — a longer one and a medium one. Think about how you'll re-prioritize the tasks.
 
(14:30)
Customer: MoSCoW might suit the whole project — what's mandatory across the full month and a half, 100%.
 
(14:43)
Customer: But if you're prioritizing the tasks themselves, there's a method called ICE. There's also RICE — they're the same family. Look them up. MoSCoW for the whole project is fine, but for prioritizing tasks it doesn't quite fit.
 
(15:16)
Customer: You're the business analyst, right? They'll teach you prioritization methods — then teach the others. Or ask [redacted] (instructor). You can describe it as "such a project, such a task — what's the best prioritization method?" The product person will understand.
 
(15:48)
Customer: Those are my comments. You can share that board/table with me if you want, and I'll leave comments on it.
 
(15:51)
Team: We also have a design prototype.
 
(16:16)
Customer: Show me. 
 
(16:45)
Team: Instead of photos we used icons — the different cleansing stages.
 
(16:46)
Customer: I have comments. The background color — I'd nudge it lighter, it's hard on the eyes.
 
(17:14)
Team: Don't look at the text — it'll be completely redone.
 
(17:15)
Customer: Okay. Overall it's good. It could be a bit more minimalist — there are a lot of plants, and it's hard to know where to look. The color palette is fine overall; I just really want a lighter background.
 
(18:10)
Customer: You can play with the font — I'd probably change it. It's hard to read, especially set in all caps; reading it diagonally is difficult.
 
(18:15)
Customer: I see this is the questionnaire, not the story yet.
 
(18:40)
Team: Yes, it's the questionnaire for now. We made two questions.
 
(18:41)
Customer: Right. The narrative emphasis should be there.
 
(18:47)
Customer: On the budget input — there might be a lot of parsing. Actually it's solved with one `if`: just ask for a number, and on the backend allow only digits, no other characters. Better to remove the wide set of choices and just enter a number — so there isn't such a big selection. And keep the emphasis on the text.
 
(19:08)
Customer: On the cards — you haven't done the "why this product" part yet. Looks cool overall. If you use icons instead of photos, won't it become too much? With ~70 different products, remove the excess and keep only what's needed. The user can tell what "cleansing" is — and it's written out anyway, that's clear. There are just too many plant elements here; remove the plants. I'd like it more minimalist, so you immediately know where to look.
 
(20:19)
Customer: And here I'd drop the total sum, for example.
 
(20:21)
Team: Odd question, but: does it feel warm and cozy? Or is there something you'd add — or something still off? We're all used to it, so it's hard to notice.
 
(20:50)
Customer: The background, 100% — it hurts my eyes, plus the plant color. Maybe a picture at the very start? The drawn illustration style — or add a bit of realism.
 
(21:16)
Team: If we add realistic jars, the way they actually look in life, the coziness disappears.
 
(21:20)
Customer: Then keep the drawn ones, maybe adjust the drawing style a little. Overall it looks fine.
 
(21:46)
Customer: Here's what you can do: search a bit for some reference sites. You can even ask the LLM which sites feel "warm" — you'll understand it. Do that outside your project/code context, without the screen context — just ask which sites, let it give you examples, and send the examples to me too. That part's great.
 
(22:17)
Customer: And the logo — is it all good? You decided to go with our own logo.
 
(22:19)
Team: Yes — but we have the variant based on the grandmother's handwriting. We can show it, though we can barely trace it ourselves. 
 
(22:44)
Customer: Oh — that's beautiful. I really like it.
 
(22:48)
Team: Should we redo things under this logo, or keep the current one?
 
(23:14)
Customer: Let's go with this one. When I saw it, my heart just — yes. In that case, change all the contacts to match too. That's important.
 
(23:18)
Customer: Rather than doing everything at once, bring me an intermediate version. That's what the consultation is for — half an hour during the week. If I forget to put slots on [redacted] (booking link), write me through [redacted] (team lead) and I'll tell you which slot is free, so you don't waste time.
 
(23:48)
Team: So we keep this logo type — this one, not that one.
 
(24:09)
Customer: [inaudible] method. Yes — build under this one. Good.
 
(24:11)
Customer: Apply the comments about the questionnaire. Well done. Really, you can reach me during the week — I don't bite.
 
(24:33)
Team: Is it better to set up a meeting or message you?
 
(24:34)
Customer: Better to set up a meeting — I don't read messages. I'll open short slots; just grab one in the comments. I can even open a 12-minute slot so we can discuss quickly.
 
(25:01)
Team: I also have a question about the cosmetic bag — which products we output. I went through the database table and split it into categories: cleansing, toning, serum, moisturizing, SPF. There were also a couple extra — a mask and a peeling-tonic. We need to output 5–10 products. The five core ones (moisturizing, cleansing, toning, serum, SPF) will be there, plus two extra. Or we could offer several products for one category.
 
(25:57)
Customer: I think it would be great to be able to offer several — that's fine.
 
(25:59)
Team: So which final set must be mandatory?
 
(26:01)
Customer: The points with the five products are mandatory, and optionally several variants per point if available.
 
(26:26)
Team: That's all our questions. Thank you.
 
(26:27)
Customer: [redacted] (instructor) replied. I'll send you a message you need to screenshot — that I agree the product's code will be available online during the course. I just need a message saying I consent to the code being available on GitHub. That message is enough — I'll write it to you now.
 
(27:01)
Customer: To summarize: everything's great, you're doing really well. On the table, write me "ready for corrections" and I'll leave comments.
 
(27:27)
Customer: Consider other prioritization methods within subtasks — those are user stories, and MoSCoW applies to the whole project; once you split a task into subtasks, MoSCoW works less well.
 
(27:53)
Customer: Set up a task tracker, learn to use it, and use it actively — ideally every day. I'll send you the consent message.
 
(27:55)
Customer: I'm open to calls and meetings — 15 minutes at the university is no problem. I'm free roughly from 9 to 8, almost always, except when I have meetings. That's all — thank you.


