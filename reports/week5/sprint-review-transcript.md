[00:00:00] Interviewer: This week, the goal of this sprint was to add a LLM rationale, add a mini questionnaire for skin type, apply design feedback, and document the architecture and process. We have documented the architecture, drawn the diagrams, and will show the LLM today.
[00:00:31] Interviewer: Let's start with the design. We've added a skin type, which is separate for the story and for the short questionnaire. The landing page has changed, and you need to choose between two short questionnaires. Let's start with the landing page. Pay special attention to the text.
[00:01:59] Customer: I would like to leave a comment here. Please send me this line, as it is difficult to read. "You are going through the selection process" - it should be "You are going through the survey process," as it sounds strange to say "selection process."
[00:03:12] Interviewer: Our landing page has been reduced.
[00:03:17] Customer: In fact, it's optimal, and I don't remember what it was like before. Have you made any changes?
[00:03:48] Interviewer: We changed everything. I'll put the old one next to it. Because of the repetition, we removed several blocks.
[00:04:45] Customer: It's great. Basically, you've just connected some blocks and placed them here, but again, we need to talk about the architectural design. People often don't know about artificial intelligence, so it's definitely not, it's super, yes, it's not, it's yes. The right column is all super, the left one needs to be changed. "We don't sell space in the selection" is super, it's great, it justifies why we're not for sale. I'll write to you today or tomorrow. They've changed this as well.
[00:06:52] Interviewer: Yes, it was unclear, so we changed it to a clearer one. It looked unclear on the website.
[00:06:58] Customer: It's like nothing has changed, but it feels like something has changed.
[00:07:00] Interviewer: Yes, it was blurry, the borders were unclear, and it didn't look good on the website. And here's the hat.
[00:07:15] Customer: They even found my email. I probably shouldn't leave this here, the hat.
[00:07:41] Interviewer: What if there's a cloud instead of a hat? And that's where we added "politics."
[00:07:45] Customer: Well, let it be, it should be there anyway. Just remove the hat here. It's so fun to see your contacts here. It's just a little bit, I don't know.
[00:08:18] Interviewer: Highlight it somehow?
[00:08:20] Customer: No, not highlight, on the contrary. Now it's kind of abrupt, maybe put it in this bar at the bottom, so it's casual, but it's important for us to say. It's aligned with the main landing page design to provide some separation and prevent repetition. Apart from the text and a few comments, I like it even without a background. I see you haven't tried with the gradient.
[00:09:17] Interviewer: Not yet.
[00:09:19] Customer: And you shouldn't.
[00:09:20] Interviewer: We thought we couldn't do that anymore, because the pictures are the colors and they give, they create the color already.
[00:09:45] Customer: In general, yes, I like the landing. Not considering the small comments, I really like it.
[00:10:00] Interviewer: Then we're taking a new landing. Let's move on to the short questionnaire. Since you said that we have a lot of text on the short questionnaire, we've removed it, and now we can compare the old short questionnaire and the short questionnaire without text. Which one is better? We've removed the explanation of why we're asking this question.
[00:11:07] Customer: It's actually difficult because, on the one hand, we're conveying the brand's identity and tone of voice. It's like it's really dry here. Let's read what it says. It's like I'm more comfortable reading the explanations.
[00:12:14] Interviewer: There is an option to reduce the text of the question explanation and then there will be less text or leave it as it is.
[00:12:30] Customer: Try to reduce the text on 2-3 slides, you can throw me both options. As if with the text is still more pleasant from the user experience side. Literally 2-3 slides reduce and throw me how it looks.
[00:13:09] Interviewer: Now the most interesting thing is that we have different skin types for the story and the questionnaire, because the styles are slightly different. The text is the same.
[00:13:30] Customer: Oh, is this about selecting a skin type in the story?
[00:13:32] Interviewer: Yes, if the user is not sure about their skin type.
[00:13:35] Customer: You're really smart, it's cool, well done, it's brilliant.
[00:13:49] Interviewer: So, if a user clicks on "I'm not sure," they'll be taken to this questionnaire, where they'll answer the questions and then be redirected back to the same question and continue with the questionnaire.So far, this is our idea. There will be 4 questions, and we have 5 different results, with separate explanations for each.
[00:14:57] Customer: That's great. It's super, it's confirmed. The text and the design are really cool, I really like it.
[00:15:25] Interviewer: It's the same design, but the only difference is that there are no orange rectangles, because that's the story we're telling. We have a question about it. In the story, we write "sun" somewhere and "koyash" somewhere else. We write how, in English or in Russian?
[00:16:37] Customer: Koyash is the brand name. It depends on how you want to show it. If you're writing on behalf of the brand, then write koyash, because it's not entirely obvious that koyash translates to "sun," so if you're referring to the actual sun, then write "sun," but if you're writing on behalf of the brand, then write "koyash."
[00:17:00] Interviewer: We just have a mascot, the sun, and the sun tells the story and how to choose the right care.
[00:17:07] Customer: Well, you know, from the user's and the brand's perspective, it's better to speak on behalf of the brand.
[00:17:20] Interviewer: Then another question. If we're speaking on behalf of the brand, then it's he or she.
[00:17:27] Customer: And where should it be used?
[00:17:29] Interviewer: Well, for example, in the skin type. Analyzed or analyzed the answer?
[00:17:37] Customer: Well, let's say "analyzed," it seems more logical. A brand is like male, koyash is replaced with a brand, so to speak.
[00:18:02] Interviewer: Then that's all about the design. I'll show you the website, we've changed the budget and LLM. There's also an old landing page.
[00:18:58] Customer: Have you fixed the questionnaire?
[00:19:02] Interviewer: There's no white screen, if that's what you're referring to. We haven't added anything about age yet. There's also a skin type test.
[00:20:04] Customer: Is the sunbeam like Koyash?
[00:20:07] Interviewer: Yes, it's like a sunbeam flipping through a notebook.
[00:20:15] Customer: Probably Koyash is better then.
[00:20:17] Interviewer: Okay. We'll change everything to koyash. Here's the budget we've added.
[00:20:49] Customer: By the way, it's great.
[00:20:50] Interviewer: It's difficult to find a match, but the database has a clear distribution by range, which makes it easier for me to understand.
[00:21:00] Customer: Yes, well done.
[00:22:13] Interviewer: Here here is an option, I thought it would be LLM somehow do, but apparently not, you can just determine yourself, if, for example, pregnancy and feeding, then products with some components, retinol, for example, we will not recommend them. In other words, to prescribe somehow ourselves.
[00:22:35] Customer: You can do it yourself, I think I know what to do. If there's an option in the filtering, and if something doesn't work out or everything shifts, it's not a big deal. If it's about testing cosmetic bags, let's avoid this, considering that the filtering didn't work out, so I can ensure that everything is correct. The filtering works well, by the way. The steps are well-defined. Then you can make a little guide, it's outside of your project, but if you want, go ahead, but I don't think it's worth your time. Did you set the average price?
[00:24:46] Interviewer: Yes.
[00:24:47] Customer: Perfect.
[00:24:48] Interviewer: We added this because the price is actually different.
[00:25:01] Customer: I was also thinking today that I'll have to pull out the prices of products and update them every day. I haven't figured out how to do this yet because the Golden Apple is blocking it. Have you tried it?
[00:25:15] Interviewer: We discussed this issue and came to the conclusion that it probably won't work.
[00:25:21] Customer: No, they update the cache every five minutes, which is almost impossible. I've tried it. So this one had a history, and it's great. Can I choose two?
[00:26:25] Interviewer: Yes, you can choose all three.
[00:26:26] Customer: All right, that's great. It's great, I don't even have anything to say. I just need to make some minor adjustments, and everything is great.
[00:27:20] Interviewer: Next week, we'll be creating an account, logging in, and what should be included in the account? Will the collected cosmetic bags be saved?
[00:27:27] Customer: Yes, the cosmetic bag should be saved. I think I specified this in the technical requirements, but I don't remember. The cosmetic bag should be saved when creating an account, along with the name, age, phone number, and email. It's better to use email for authorization. I think I also specified in the technical requirements, but I don't remember if I did or not, that users can mark whether they like or dislike the product, provide feedback, and track their progress over time. Look at the technical specifications, if it's not written there, then okay, if there's still time, then why not. It's just that I had it in mind from the beginning, so here it is. Look at the technical specifications, if I haven't specified it, then there's no need.
[00:29:25] Interviewer: All right, thank you. That's all for now.