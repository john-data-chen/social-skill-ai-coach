/**
 * Shared social-skills knowledge base.
 *
 * Distilled faithfully from the 8-lesson course in
 * `refs/social-skills-classes/`. Each stage prompt in this folder composes only
 * the slices it needs, so the course stays the single source of truth instead of
 * being re-summarized (and drifting) inside each prompt. The agents still reply
 * to the user in Traditional Chinese — that is enforced by each prompt's
 * CRITICAL RULE, not by the language of this reference material.
 */

// Lesson 1 + 4: what friendship is, and its depth levels.
export const FRIENDSHIP = `Traits of friendship: shared interests, kindness and care, support, mutual understanding, keeping promises and loyalty, honesty and trust, equality, mutual self-disclosure, willingness to resolve conflicts.
Depth levels (shallow to deep): online acquaintance < nodding acquaintance < casual friend < close friend < best friend.
Friendship is a two-way choice: others may choose whether to befriend you, and you need not befriend everyone.`

// Lesson 1: how to open a conversation + the five opener families + the
// step-by-step approach sequence.
export const OPENING = `Four steps to open: ask a question -> share your own info within the question -> find common ground -> ask related 5W1H questions (When/Who/Where/What/Why/How). Keep it a two-way exchange: don't do all the talking, don't interrogate, don't ask overly private or awkward questions.

Five opener families (examples):
- Situational: "This event is more interesting than I expected - what do you think?" / "How did you find today's session?"
- Observational: "I saw you picked this book; I like this author too - what do you think of his work?" / "Your backpack design is interesting, where did you get it?"
- Open-ended: "What kind of events do you usually enjoy?" / "Is this your first time here? How do you feel about it?"
- Low-personal: "How did you find out about this event?" / "Have you tried their food? I haven't decided what to order."
- Light humor: "There are so many people here, I'm about to get lost in the crowd!"

Approach sequence: glance casually at the person -> opener -> find a shared interest -> raise the shared interest -> exchange info -> gauge their engagement -> leave if uninterested / introduce yourself if interested.`

// Lesson 1: the three-way loop that keeps a conversation going.
export const CONVERSATION_TRIANGLE = `Conversation triangle (rotate to stay balanced):
1. Ask questions.
2. Compliment - sincerely and specifically praise something you genuinely like; don't over-compliment, it reads as insincere.
3. Share your own related experience.
Sustaining: don't repeat yourself, don't over-explain details, listen attentively.`

// Lesson 2: open vs closed questions + the "three follow-ups" rule.
export const OPEN_CLOSED_Q = `Open vs closed questions:
- Closed: answerable with yes/no or a few fixed answers; good for confirming facts, but tends to end the conversation.
- Open: invites varied answers. Wait patiently before they respond - don't interrupt or give examples first: interrupting seems impatient, and giving an example first biases their answer away from what they actually think.
Three related follow-ups: if they give more clues, follow the thread; if they answer "I don't know" or respond coldly, change the topic.`

// Lesson 2: the social errors to avoid (the rubric's "do-not" list).
export const SOCIAL_ERRORS = `Social errors to avoid: don't brag, don't be argumentative, don't correct others / play the "grammar police", don't be sarcastic, don't speak too loudly or too softly, don't hog the conversation (monologue), don't ask overly private or too-early personal questions.
Physical boundaries: keep about an arm's length of social distance; don't touch the other person.
Eye contact: maintain appropriate eye contact - neither staring nor never looking.
Compliments: praise a specific strength sincerely; don't give empty or constant praise (it reads as fake).
Core mindset: socializing is continually modeling how the other person sees you - How do they feel about you? Would they want to keep talking?`

// Lesson 1 + 4: reading whether the other person is engaged / interested.
export const INTEREST_SIGNALS = `Gauging engagement (in the moment): Are they talking with you or shutting you down? Do they look at you, smile, get distracted? Is their body turned toward you (open) or away (closed)? Leave politely if uninterested; continue if interested.
Gauging their longer-term interest in you: they seek you out or respond to you, invite you to do things, accept your invitations, leave or ask for contact info, call or message just to chat, take your calls and reply, accept your social-media requests, say things that make you feel accepted.`

// Lesson 3: all non-face-to-face communication.
export const ELECTRONIC_COMMS = `Electronic communication covers all non-face-to-face contact (calls, messaging).

Before exchanging contact info: have several conversations and exchange info first, find a shared interest, use that shared interest as the reason to exchange contact, and gauge their interest in staying in touch (rejection / cold response / vague replies like "maybe next time"). When proposing the exchange, always add "no problem at all if it's not convenient for you." Even if rejected: don't stop the conversation immediately - switch to a related but indirect topic and wrap up later; being rejected now doesn't mean forever (relationships are an infinite game - try a few more times).
Common mistakes: asking for contact info directly, not chatting for 5-10 minutes first, making them feel they can't say no.

Phone call steps: (landline) say who you're looking for and who you are -> greeting -> ask if it's a good time ("Can I borrow 10 minutes of your time?") -> state the reason for calling.
Ending a call: wait for a pause -> give a reason you must hang up -> say you enjoyed talking -> say you'll reach out again -> say goodbye.
Voicemail: who you are -> who you want -> time of call -> reason -> callback number -> goodbye.

Messaging rules: identify yourself on first contact; prepare an opener before messaging someone you don't know well; don't call or message before 9am or after 9pm; if no reply, send at most 2 more messages; don't send overly private things (assume anyone can see the message; keep private matters for in person); no spam or irrelevant stickers; don't call for no reason; use stickers to convey emotion but avoid overuse or replying only with stickers.

Social media: check in only after you leave; don't add strangers; don't post public personal info; quality over quantity; don't overshare; don't take sides on controversial issues; don't be a troll; don't engage negative comments (or delete them); remove tags on negative posts/images; don't post pointless content.`

// Lesson 5: humor - high risk/reward; timing, hidden rules, reading reactions.
export const HUMOR = `Humor at the right time is attractive; at the wrong time it gets you disliked faster.

Timing: avoid jokes over non-face-to-face channels (no expression/tone, easily misread; if you must, add an emoji / LOL / XD at the end); don't joke on first meeting or before you know someone; don't joke until you're sure of the timing and the person.
Hidden rules: no stale memes, no humiliating others, no dirty jokes, don't make yourself the butt of the joke, don't joke with elders or authority figures, no in-jokes only you understand, don't laugh before you finish the joke.

Reading reactions:
- Negative: no laugh at all, or "mocking" cues (laughing while rolling eyes, laughing before you finish, forced laugh after it gets awkward, laughing while pointing at you, laughing while shaking head, sarcastic remarks).
- Neutral (polite smile): delayed reaction, a pause to think, a smile only after fidgeting with hair, etc.
- Positive (genuinely funny): laughs out loud shortly after with a smile, compliments the joke, nods while laughing, asks you to say more, starts telling jokes too.`

// Lesson 6: joining an ongoing group conversation.
export const GROUP_JOIN = `Steps to join a group conversation: listen to the conversation -> observe from more than an arm's length -> identify the topic -> find a shared topic -> move in to about an arm's length -> opener ("I overheard what you were saying...") -> pause and watch their reaction to the opener -> continue -> check whether you're accepted (facing you? responding? open body language?) -> introduce yourself.
Common practice mistake: cutting in with your own topic before someone has answered a question. Pause more, observe reactions, let others say more - don't hijack the conversation.`

// Lesson 7: when the group does not accept you - diagnose, exit gracefully.
export const GROUP_EXIT = `About half the time a group won't accept you; you usually can't know the real reason, so follow the standard steps a few times - if still rejected, the cause may genuinely not be you. If you can't find a good pause, just give up (infinite game; forcing in makes acceptance even less likely).

Possible reasons not accepted -> next-time fix:
- They want privacy -> listen to the topic first, confirm it's okay to join.
- Rude or hostile to joiners -> leave; no need to join an unfair group.
- Poor joining technique -> review the standard steps and retry.
- Got too personal after joining -> center on their topic after joining.
- They don't want new members -> leave; they have the right to choose.
- They're discussing something you don't know -> wait for a topic you understand, or find another group.
- You have a bad reputation among them -> find a group that doesn't know or mind.
- They didn't know you wanted to join -> wait for a pause, review the steps, then join.

Exit steps (not accepted): stay calm -> look elsewhere -> face another direction -> slowly and quietly walk away.
Accepted then iced out (more common): stay calm -> look elsewhere -> wait for a pause -> very brief goodbye ("I'll head off") -> leave.
Fully accepted, leaving: wait for a pause -> give a specific reason for leaving ("I have to get going") -> say goodbye ("see you next time") -> leave.`

// Lesson 8: planning and hosting a social gathering.
export const HOSTING = `Plan a gathering with 5W: Who (how many, which people), What (activity), Where, When (start/end, phased schedule), How.
Prep: contact attendees and helpers to confirm; clean the space (in a private space, put away anything you don't want seen); have drinks, snacks, and backup activities ready.
Start: greet -> invite them in -> introduce people (at least names; if they share something, help open a topic) -> introduce the space (in a private space, always point out the restroom and the gathering area) -> serve snacks -> start the activity or ask what they'd like to do.
Principles: the gathering is activity-based but socializing is the main point - spend at least half the time chatting and exchanging info; attend to every guest, don't leave anyone out; keep gatherings short until you're experienced at hosting.
Activities: winning/losing isn't the point (winners don't gloat, losers don't get emotional; throw the game if needed); following rules isn't the point (state them upfront, remind occasionally, don't constantly correct or coach); be a good participant who keeps the energy up.
Ending: state an end time in advance, or wait for a lull -> give a reason to end while standing up and slowly moving toward the door with a see-you-out gesture -> thank everyone again and say goodbye.
Prerequisite: every conversation at a gathering rests on the basic conversation steps and rules, so practice conversation fundamentals - especially group conversation - extensively before hosting.`

// Lesson 4: questions to reflect on after a conversation (drives Reflection).
export const TWO_WAY_SELF_CHECK = `After a conversation, ask yourself: Did you start it or did they? Did they seem to want to talk, and how do you know? Did you exchange info - what did you learn about them? What are their interests, and what could you do together? Do they seem to want to do something with you, and do you want to with them?`
