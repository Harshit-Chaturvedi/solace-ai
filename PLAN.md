Solace AI
Full Implementation Plan for an AI-Powered Wellness
Companion
React Native + Expo | Node.js + Express | MongoDB | Gemini API
Written to be executed phase by phase by an AI coding agent (Google
Antigravity with a Gemini Flash model).




What is inside
1. How to drive Antigravity / Gemini Flash with this plan (rules file + workflow)
2. Product scope and what to make excellent
3. Tech stack, architecture, folder structure
4. Database schema and full REST API contract
5. AI companion design: persona, context builder, memory, mood detection, safety
6. Design system: colours, type, motion, haptics, mascot
7. Screen-by-screen specification
8. Notifications that work in background / closed state with deep links
9. 14 build phases, each with a copy-paste prompt and an acceptance checklist
10. APK build, backend deployment, demo video script, troubleshooting
 1. How to use this plan with Antigravity + Gemini
 Flash
 Flash models are fast and capable, but they do best with small, explicit, verifiable tasks. They
 go wrong when given a huge goal at once: they skip steps, invent package APIs, or rewrite working
 files. This plan is therefore split into 14 phases. Each phase has a goal, the exact files to touch, a
 prompt to paste, and a checklist. Do not start the next phase until the checklist passes.

 1.1 Golden rules for the human driving the agent
  1. One phase per conversation/task. Start a fresh agent task for each phase; paste the Project
    Rules (1.2) plus the phase prompt.
  2. Commit after every green phase: git add -A && git commit -m "phase N done". If the
    agent breaks something, git checkout . and re-prompt with a smaller ask.
  3. Run the app yourself after each phase (npx expo start + npm run dev on server). Paste
    exact error text back to the agent; do not paraphrase errors.
  4. Let Expo pick package versions. Always install Expo libraries with npx expo install
    <pkg>, never plain npm install, so versions match the SDK.
  5. When stuck in a loop (same error 3 times): stop, ask the agent to explain the root cause in 5
    lines before writing code, or switch that one step to a stronger model (Gemini Pro / Claude) and
    come back.
  6. Keep PLAN.md and PROGRESS.md in the repo. Put this plan's text in PLAN.md; the agent
    appends a 3-line summary to PROGRESS.md at the end of each phase. New tasks start by
    reading both.


 1.2 Project Rules (save as AGENTS.md in repo root and add to
 Antigravity workspace rules)
  AGENTS.md
  # Solace AI - Agent Rules
  You are building Solace AI: Expo (React Native, TypeScript) app in /app and a
  Node.js + Express + TypeScript + MongoDB API in /server.

  ALWAYS
  - Read PLAN.md and PROGRESS.md before starting. Do ONLY the current phase.
  - TypeScript strict. No `any` unless commented why.
  - Install Expo packages with `npx expo install`. Server packages with npm.
  - Use expo-router (file-based routes in app/app/). No react-navigation setup by hand.
  - All colours/spacing/fonts come from app/src/theme. Never hard-code hex in screens.
  - All API calls go through app/src/api/client.ts. Base URL = EXPO_PUBLIC_API_URL.
  - Server: validate every request body with zod; return {error:{code,message}} on failure.
  - Secrets only in .env files (never commit). Provide .env.example.
  - Keep files < 250 lines; split into components/hooks.
  - After changes: run `npx tsc --noEmit` in the folder you changed and fix all errors.
  - At the end, append to PROGRESS.md: phase, what was built, how to test, known issues.

  NEVER
  - Never delete or rewrite files outside the phase scope.
  - Never invent library APIs. If unsure, check the package docs/README first.
  - Never put the Gemini API key in the mobile app. AI calls go through the server only.
  - Never add a new major library not listed in PLAN.md without saying why.



 1.3 Suggested timeline (about 8-10 days)
 Day          Phases              Outcome

 1            0, 1, 2             Repos, theme, fonts, mascot component, server skeleton + DB



Solace AI - Implementation Plan                                                                           2
 Day          Phases              Outcome

 2            3, 4                Auth API + splash, onboarding, sign up / login, profile setup

 3            5, 6                Tab navigation, Home screen, mood check-in with API

 4-5          7, 8                AI chat (context, memory, mood detection, activity cards), chat history

 6            9, 10               Breathing, affirmations, journal/reflection, wellness plan

 7            11                  Notifications + reminders settings + deep links

 8            12, 13              Insights/progress/streaks, polish, haptics, empty states

 9-10         14                  Deploy backend, build APK, record demo video, buffer for bugs




Solace AI - Implementation Plan                                                                             3
 2. Product scope - what to build and what to
 make excellent
 The brief says: doing one part extremely well is better than doing everything poorly, and AI is the
 most important part. So the strategy is: a complete, polished end-to-end journey, with the AI
 companion as the hero feature.

 2.1 The concept
 Solace is a calm daily companion. Its AI is a character called Sol - a soft, glowing blob with eyes
 that blinks, breathes and changes expression with the user's mood. Sol is everywhere: it greets you
 on Home, chats with you, guides breathing, and its expression on the Home screen reflects your
 last check-in. Sol remembers (with consent): 'Last Tuesday you said work deadlines were stressing
 you - how did the presentation go?'

 2.2 Feature priority
 Priority               Feature                                                  Notes

 P0 (must,              Splash, onboarding (3 slides), sign up / login,          Profile setup asks name, goals,
 polished)              profile setup                                            preferred check-in time, companion
                                                                                 tone

 P0                     Home: greeting, Sol mascot, mood check-in, daily         The screen people open every day
                        affirmation, AI suggestion card, streak, quick
                        actions

 P0 (hero)              AI chat with Sol: mood-aware, context + long-term        Biggest scoring area
                        memory, activity suggestion cards, chat history
                        (list, continue, new, delete)

 P0                     Notifications: daily check-in, affirmation, breathing,   Must work with app closed
                        custom reminders; manage times; tap opens
                        correct screen

 P1                     Breathing exercise (animated, 3 patterns, haptics)       Launchable from chat cards

 P1                     Insights: mood trend chart (7/30 days), streaks,
                        achievements, AI weekly summary

 P1                     Reflection journal with AI prompt of the day             Feeds AI memory

 P2 (if time)           Wellness assessment (short PHQ-style self-check,         Clearly labelled not a diagnosis
                        non-diagnostic) and AI 7-day plan

 P2                     Voice input in chat, dark mode                           Nice-to-have



 2.3 Things that will impress judges
  • Sol's face reacting live while the user types or while AI is 'thinking' (Reanimated).
  • AI reply that ends with a tappable card like 'Try 2-min Box Breathing' which opens the breathing
    screen pre-configured.
  • A visible 'What Sol remembers' screen where users can view and delete memories, plus a
    toggle to turn memory off (consent and control, which the brief asks for).
  • Gentle crisis safety: if the user expresses self-harm thoughts, Sol responds with care and shows
    helpline buttons (India: Tele-MANAS 14416). Wellness judges notice this.
  • Haptics on every meaningful tap, smooth shared transitions, no white flashes, skeleton loaders.




Solace AI - Implementation Plan                                                                                       4
 3. Tech stack and architecture
 Layer               Choice                                              Why

 App framework       Expo (latest stable SDK) + React Native +           Required by brief; EAS builds APK
                     TypeScript

 Routing             expo-router (file-based, typed routes)              Deep links from notifications for free

 Styling             StyleSheet + theme tokens (src/theme)               Fewer config errors than Tailwind setups
                                                                         for a Flash agent

 Animation           react-native-reanimated,                            Mascot, breathing circle, transitions
                     react-native-gesture-handler, react-native-svg

 Extras              expo-linear-gradient, expo-blur, expo-haptics,      Calm visuals + haptics
                     expo-font + @expo-google-fonts

 State / data        @tanstack/react-query (server data) + zustand       Caching, loading states, simple global
                     (auth/session, UI)                                  store

 Secure storage      expo-secure-store (JWT)                             Token not in plain AsyncStorage

 Notifications       expo-notifications (local scheduled) + optional     Works when app closed
                     Expo Push from server

 Backend             Node.js 20+, Express, TypeScript, zod,              API-driven backend as required
                     jsonwebtoken, bcryptjs, helmet, cors,
                     express-rate-limit

 Database            MongoDB Atlas (free tier) + Mongoose                Chat messages fit documents well; free
                                                                         hosting

 AI                  Google Gemini via official @google/genai SDK on     Fast, cheap, JSON output support
                     the server; model name from env GEMINI_MODEL
                     (current Flash model)

 Hosting             Render or Railway (server), Atlas (DB), EAS Build   All have free tiers
                     (APK)



 3.1 Architecture
  High-level flow
   [Expo App] --HTTPS/JSON + JWT--> [Express API] --Mongoose--> [MongoDB Atlas]
       |                                   |
       | local scheduled notifications     +--> [Gemini API] (chat, mood tag,
       | (expo-notifications)              |                   memory extraction,
       |                                   |                   affirmations, summary)
       +<-- Expo Push (optional) ----------+--> node-cron jobs (weekly summary, push)



 3.2 Folder structure




Solace AI - Implementation Plan                                                                                     5
  Monorepo layout
  solace/
    AGENTS.md PLAN.md PROGRESS.md
    app/                          # Expo app
      app/                        # expo-router routes
         _layout.tsx              # fonts, providers, notification listeners
         index.tsx                # splash -> redirect logic
         (onboarding)/index.tsx
         (auth)/login.tsx signup.tsx profile-setup.tsx
         (tabs)/_layout.tsx home.tsx chat/index.tsx insights.tsx profile.tsx
         chat/[id].tsx            # a conversation
         breathe.tsx checkin.tsx journal.tsx affirmation.tsx
         reminders.tsx memories.tsx plan.tsx
      src/
         api/        client.ts auth.ts mood.ts chat.ts reminders.ts ...
         components/ ui/ (Button, Card, Input, Chip, Screen, Skeleton)
                     Sol/ (SolMascot.tsx, expressions.ts)
                     chat/ (MessageBubble, ActivityCard, TypingSol, Composer)
         hooks/      useAuth.ts useMood.ts useNotifications.ts
         store/      auth.ts
         theme/      colors.ts typography.ts spacing.ts index.ts
         lib/        haptics.ts notifications.ts dates.ts
    server/
      src/
         index.ts app.ts config/env.ts db.ts
         middleware/ auth.ts error.ts validate.ts rateLimit.ts
         models/     User Mood Conversation Message Memory Reminder Journal Activity
         routes/     auth mood chat memories reminders journal activities insights
         services/   ai/ (gemini.ts, prompts.ts, contextBuilder.ts, safety.ts,
                          memoryExtractor.ts, moodTagger.ts)
                     streak.ts insights.ts
         jobs/       weeklySummary.ts
      .env.example




Solace AI - Implementation Plan                                                        6
 4. Database schema (MongoDB / Mongoose)
 All documents have createdAt/updatedAt (timestamps: true). Every query is filtered by userId
 from the JWT - never trust a userId from the request body.

 Collection         Fields                                                                            Indexes

 users              email (unique, lowercase), passwordHash, name, avatarColor, goals:                email unique
                    string[] (e.g. 'sleep better','reduce stress'), companionTone:
                    'gentle'|'cheerful'|'direct', checkinTime 'HH:mm', timezone,
                    memoryEnabled: bool (default true), onboardingDone: bool,
                    expoPushToken?, streak {current, longest, lastActiveDate}

 moods              userId, mood: 'great'|'good'|'okay'|'low'|'awful', score 1-5, emotions:           userId +
                    string[] (anxious, grateful, tired...), note?, source: 'checkin'|'chat'           createdAt desc

 conversations      userId, title (AI-generated after 2nd message), lastMessageAt, summary            userId +
                    (rolling, AI), detectedMood?, messageCount                                        lastMessageAt
                                                                                                      desc

 messages           conversationId, userId, role 'user'|'assistant', content, mood? (tag for user     conversationId +
                    msgs), suggestion?                                                                createdAt
                    {type:'breathing'|'journal'|'affirmation'|'checkin'|'selfcare', title, params},
                    flagged?: 'crisis'

 memories           userId, text ('Has a job interview on Friday'), category                          userId
                    'life_event'|'preference'|'struggle'|'goal'|'person', sourceConversationId,
                    importance 1-3

 reminders          userId, type 'checkin'|'affirmation'|'breathing'|'selfcare'|'custom', title,      userId
                    body, time 'HH:mm', days number[] (0-6), enabled, localNotificationIds:
                    string[] (stored on device only - optional)

 journals           userId, prompt, content, aiReflection?                                            userId +
                                                                                                      createdAt

 activities         userId, type 'breathing'|'journal'|'affirmation'|'challenge', durationSec?,       userId +
                    meta                                                                              createdAt

 achievements       userId, key ('first_checkin','streak_7','breath_10'...), unlockedAt               userId + key
                                                                                                      unique




Solace AI - Implementation Plan                                                                                          7
 5. REST API contract
 Base path /api/v1. JSON only. Auth via header Authorization: Bearer <jwt> (except auth
 routes and /health). Errors: { "error": { "code": "VALIDATION", "message": "..." } } with
 proper HTTP status.

 Method & path                      Body / query                          Returns

 GET /health                        -                                     {ok:true}

 POST /auth/signup                  {name,email,password(min 8)}          {token,user}

 POST /auth/login                   {email,password}                      {token,user}

 GET /me                            -                                     user (no passwordHash)

 PATCH /me                          {name?,goals?,companionTone?,chec     user
                                    kinTime?,timezone?,memoryEnabled?
                                    ,onboardingDone?,expoPushToken?}

 DELETE /me                         -                                     deletes user and ALL their data

 GET /home                          -                                     {greeting, todayMood?,
                                                                          affirmation,
                                                                          suggestion{title,reason,action},
                                                                          streak, quickActions} (one call
                                                                          powers Home)

 POST /moods                        {mood,emotions?,note?}                {mood, streak, solReply (short AI
                                                                          line reacting to the check-in),
                                                                          achievementsUnlocked[]}

 GET /moods?range=7|30              -                                     [{date, score, mood, emotions}]

 GET /conversations                 ?cursor                               [{_id,title,lastMessageAt,preview,
                                                                          detectedMood}]

 POST /conversations                {firstMessage?}                       {conversation, messages[]} (Sol
                                                                          greets first if empty)

 GET /conversations/:id/messages    ?before=cursor&limit;=30              messages[]

 POST /conversations/:id/messages   {content}                             {userMessage, assistantMessage
                                                                          (with suggestion?), conversation}

 PATCH /conversations/:id           {title}                               conversation

 DELETE /conversations/:id          -                                     204 (also deletes its messages)

 GET /memories                      -                                     memories[]

 DELETE /memories/:id / DELETE      -                                     204 (one / all)
 /memories

 GET/POST/PATCH/DELETE              {type,title,body,time,days,enabled}   reminder(s)
 /reminders(/:id)

 POST /activities                   {type,durationSec?,meta?}             {activity, streak,
                                                                          achievementsUnlocked[]}

 GET /affirmations/today            -                                     {text} (AI-personalised, cached
                                                                          per user per day)

 POST /journals / GET /journals     {prompt,content}                      {journal with aiReflection}

 GET /journals/prompt               -                                     {prompt} (AI prompt of the day)




Solace AI - Implementation Plan                                                                                8
 Method & path                    Body / query   Returns

 GET /insights?range=7|30         -              {moodSeries, avgScore,
                                                 topEmotions, activityCounts,
                                                 streak, achievements,
                                                 weeklySummary}




Solace AI - Implementation Plan                                                 9
 6. AI companion design (the hero feature)
 6.1 Sol's persona (system prompt)
 Stored in server/src/services/ai/prompts.ts. The placeholders in {{ }} are filled by the
 context builder.

  SOL_SYSTEM_PROMPT
  You are Sol, the warm AI companion inside the Solace wellness app.
  Personality: gentle, curious, emotionally intelligent, a little playful. You speak
  like a caring friend, not a therapist and not a motivational poster.
  Tone preference of this user: {{companionTone}}.

  How you respond:
  - First reflect what the user feels in your own words (1 sentence). Be specific to
    what they said. Never use generic lines like "You've got this!" or "Stay positive".
  - Then ask ONE thoughtful follow-up question OR offer ONE small, concrete idea.
  - Keep replies short: 2-4 sentences, max ~80 words, unless the user asks for more.
  - Use what you know about the user naturally (memories, recent moods) but do not
    list it back to them or sound like a database.
  - Suggest an in-app activity only when it truly fits (anxious -> breathing,
    overthinking -> journaling, low self-worth -> affirmation). At most one per reply.
  - Match the user's language (English, Hindi, Hinglish).
  - You are not a doctor. Do not diagnose or give medication advice.
  - If the user mentions self-harm, suicide, or being in danger: respond with deep care,
    encourage reaching out to someone they trust or a helpline now, and set
    "safety": true in your output.

  User profile: name={{name}}, goals={{goals}}
  Recent moods (newest first): {{recentMoods}}
  Things you remember about the user: {{memories}}
  Summary of earlier parts of this conversation: {{conversationSummary}}
  Today: {{dateTime}} (user local time)

  Return ONLY JSON matching the provided schema.



 6.2 Structured output (every chat reply)
 Call Gemini with responseMimeType: 'application/json' and a responseSchema. This gives the
 app a reply AND machine-readable signals in one call - no second request needed.

  Response schema
  {
      "reply": string,                       // text shown in the bubble
      "userMood": "great"|"good"|"okay"|"low"|"awful"|null,
      "emotions": string[],                  // e.g. ["anxious","tired"]
      "suggestion": null | {
          "type": "breathing"|"journal"|"affirmation"|"checkin"|"selfcare",
          "title": string,                   // "2-min box breathing"
          "params": { "pattern"?: "box"|"478"|"calm", "minutes"?: number,
                       "prompt"?: string }
      },
      "safety": boolean
  }



 6.3 Context builder (contextBuilder.ts) - how Sol 'remembers'
  1. Load user profile (name, goals, tone, memoryEnabled).
  2. Load last 7 mood entries -> compact string: 'Mon: low (tired, anxious); Sun: good'.
  3. If memoryEnabled: load up to 15 memories sorted by importance desc, recency desc.
  4. Load the conversation's rolling summary + the last 16 messages as chat history (role
    user/model).


Solace AI - Implementation Plan                                                               10
  5. Fill the system prompt; send history + new user message to Gemini.
  6. Total context stays small and cheap; older content survives through summary and memories.


 6.4 Background AI jobs (run after the reply is sent, do not block the
 user)
  • Title: after the 2nd user message, generate a 3-5 word title.
  • Rolling summary: every 10 messages, summarise older messages into conversation.summary
    (max 120 words).
  • Memory extraction (if memoryEnabled): every 6 user messages, ask Gemini: 'From these
    messages extract durable facts worth remembering (life events, people, goals, preferences,
    struggles). Return JSON array of {text, category, importance}. Return [] if none. Do not duplicate
    these existing memories: ...'. Save new ones.
  • Mood from chat: if userMood is returned with confidence, save a mood doc with source 'chat'
    (max one per conversation per 3 hours) so Insights reflects chats too.


 6.5 Safety layer (safety.ts)
  • Before calling Gemini, run a quick keyword check (English + Hindi/Hinglish phrases such as 'kill
    myself', 'end my life', 'suicide', 'marna chahta', 'jeena nahi'). If matched OR model returns
    safety=true: mark message flagged='crisis'.
  • The app then shows a calm Support card under Sol's reply: 'You don't have to go through this
    alone' + buttons: Call Tele-MANAS 14416 (India, 24x7), Call emergency 112, Talk to someone I
    trust (opens contacts). Use Linking.openURL('tel:14416').
  • Keep Gemini safety settings at defaults. Never let Sol argue, dismiss, or give methods.
  • Add a one-line disclaimer in onboarding and Profile: 'Solace supports wellbeing; it is not a
    medical or emergency service.'


 6.6 Other AI endpoints
 Feature                Prompt idea                                                     Caching

 Daily affirmation      Using goals + last 3 moods + 3 memories, write one              Cache per user per day
                        first-person affirmation, max 18 words, specific, not cheesy.   in users or a small
                                                                                        collection

 Home suggestion        Given mood today/yesterday and time of day, pick ONE activity   Cache 3 hours
                        and a one-line reason. JSON {title, reason,
                        action:{type,params}}

 Check-in reaction      One warm sentence (max 20 words) reacting to the mood +         None
                        emotions + note.

 Journal reflection     2-3 sentences reflecting back themes, one gentle question.      Stored on journal

 Weekly summary         From 7 days of moods, activities, journal themes: 3 bullet      Cron every Sunday or
                        insights + 1 focus for next week.                               on-demand, cache 24h



 6.7 Gemini service skeleton




Solace AI - Implementation Plan                                                                                  11
  server/src/services/ai/gemini.ts (shape, verify against current @google/genai docs)
  import { GoogleGenAI, Type } from "@google/genai";
  import { env } from "../../config/env";

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  export async function generateJSON<T>(opts: {
    system: string; history: { role: "user" | "model"; text: string }[];
    schema: object; temperature?: number;
  }): Promise<T> {
    const res = await ai.models.generateContent({
      model: env.GEMINI_MODEL,             // e.g. current Gemini Flash model id
      contents: opts.history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
      config: {
         systemInstruction: opts.system,
         temperature: opts.temperature ?? 0.8,
         responseMimeType: "application/json",
         responseSchema: opts.schema,
      },
    });
    return JSON.parse(res.text ?? "{}") as T;
  }
  // Wrap calls with a 20s timeout + 1 retry. On failure return a kind fallback reply:
  // "I'm having trouble thinking clearly right now - can you tell me a bit more?"


 Chat UX: use a normal (non-streaming) request and show the animated 'Sol is thinking' indicator;
 then reveal the reply with a fast typewriter animation on the client. This looks like streaming but
 avoids SSE complexity in React Native.




Solace AI - Implementation Plan                                                                        12
 7. Design system
 7.1 Colour tokens (src/theme/colors.ts)
 Token                 Hex                                       Use

 bg                    #FBF8F4                                   App background (warm off-white)

 surface               #FFFFFF                                   Cards

 ink                   #2E2A47                                   Primary text

 inkSoft               #6B6880                                   Secondary text

 primary               #7C6FD6                                   Buttons, Sol body base (lavender)

 primarySoft           #ECE8FF                                   Chips, selected states

 mint                  #9ED9C3                                   Calm / breathing / success

 peach                 #FFC9A8                                   Warmth / affirmations

 sky                   #A9CBF2                                   Night / sleep

 danger                #E07A7A                                   Delete, errors (soft, not alarming)

 mood scale            great #7FD1A8, good #A9CBF2, okay         Charts, check-in faces
                       #F5D58A, low #F2B38B, awful #C9A2D8

 gradients             dawn: #FFE7D6 -> #ECE8FF; dusk: #ECE8FF   Splash, Home header changes with time of
                       -> #CFE8F5                                day



 7.2 Typography, spacing, shape
  • Headings: Fraunces (soft serif, 600) via @expo-google-fonts/fraunces. Body/UI: Nunito
    (400/600/700) via @expo-google-fonts/nunito.
  • Scale: display 34, h1 28, h2 22, h3 18, body 16, small 14, caption 12. Line height 1.35-1.5x.
  • Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40. Screen horizontal padding 20.
  • Radius: cards 24, buttons 18 (pill-ish), chips 999. Shadows very soft (opacity 0.06, radius 16).


 7.3 Motion and haptics
  • Use Reanimated springs (damping 15, stiffness 120) for press scale (0.97) on every Pressable
    card/button.
  • Screen enter: fade + translateY 12 -> 0, 280ms. List items stagger 40ms (Reanimated
    FadeInDown.delay(i*40)).
  • Haptics helper: light on tap, selection on chip/mood change, success on check-in saved / activity
    completed, soft rhythmic on breathing phase change.
  • Respect reduced motion (AccessibilityInfo.isReduceMotionEnabled): disable big loops.


 7.4 Sol mascot spec (components/Sol/SolMascot.tsx)
  • Drawn with react-native-svg: a rounded blob body (path) with a radial gradient, two oval eyes,
    small mouth path, optional cheeks.
  • Props: size, expression: 'happy'|'calm'|'concerned'|'thinking'|'sleepy'|'excited',
    breathing?: boolean.
  • Idle: body scales 1.0 -> 1.04 every 3.5s (breathing); eyes blink every 3-6s random (scaleY 1 ->
    0.1 -> 1, 120ms).




Solace AI - Implementation Plan                                                                         13
  • Thinking: eyes look up-right, three dots orbit. Concerned: eyebrows tilt, softer colour. Expression
    change = animated morph of mouth path (interpolate) or cross-fade.
  • Body colour tint follows the user's last mood (mood scale) blended with primary.




Solace AI - Implementation Plan                                                                       14
 8. Screen-by-screen specification
 Screen                 Content and behaviour

 Splash (index.tsx)     Dawn gradient, Sol fades/scales in and blinks, wordmark 'Solace' + line 'A gentle place for
                        your mind'. Meanwhile: load fonts, read token from SecureStore, call /me. Route: no token
                        -> onboarding (or login if seen before); token + !onboardingDone -> profile-setup; else ->
                        home. Min 1.6s.

 Onboarding             3 swipeable slides (FlatList pagingEnabled + animated dots): 1) 'Check in with how you
                        feel' 2) 'Meet Sol, your AI companion who listens and remembers what matters' 3) 'Small
                        daily rituals - breathe, reflect, grow'. Skip + Get started. Disclaimer line on last slide.

 Sign up / Login        Clean cards, floating-label inputs, show/hide password, inline validation, loading button,
                        friendly errors ('That email already has an account - log in?'). Keyboard-avoiding. Switch
                        links between them.

 Profile setup (3       Step 1 name + avatar colour. Step 2 goals multi-select chips (Reduce stress, Sleep better,
 steps)                 Feel happier, Build habits, Manage anxiety, Be kinder to myself). Step 3 Sol's tone (Gentle
                        / Cheerful / Direct) + check-in reminder time picker + 'Allow notifications' (ask permission
                        here with explanation). Finish -> PATCH /me + create default reminders + schedule local
                        notifications.

 Home                   Header gradient by time of day; 'Good evening, Aisha'; Sol (expression from today's
                        mood). Card 1: mood check-in (5 faces) or, if done, 'You felt okay today - Sol: ...'. Card 2:
                        affirmation of the day (tap = full-screen with share). Card 3: Sol suggests (AI) with action
                        button. Row: quick actions (Talk to Sol, Breathe, Reflect, Plan). Streak flame + 7-day dots.
                        Pull to refresh.

 Check-in (modal)       Step 1 choose mood (big animated faces, haptic per change). Step 2 emotion chips. Step 3
                        optional note. Save -> Sol's reaction bubble + streak animation + 'Talk about it with Sol'
                        button (starts a chat seeded with the check-in).

 Chat list (tab)        Big 'New conversation' button with Sol. List: title, preview, relative time, mood dot. Swipe
                        left to delete (confirm). Empty state illustration.

 Chat (chat/[id])       Inverted FlatList of bubbles; Sol avatar on assistant messages; typing indicator with Sol
                        'thinking'; ActivityCard under a message when suggestion exists (tap -> route with
                        params); Support card when flagged. Composer with multiline input, send button with
                        haptic, quick reply chips when empty ('I feel anxious', 'Bad day', 'Help me sleep'). Header
                        menu: rename, delete.

 Breathe                Choose pattern: Box 4-4-4-4, 4-7-8, Calm 4-6. Big circle (or Sol) expands/contracts in sync
                        with phase text 'Breathe in...'. Haptic at each phase change. Duration 1/2/5 min. Finish ->
                        POST /activities, success screen.

 Journal                AI prompt of the day, text area, save -> AI reflection shown in a soft card. List of past
                        entries.

 Insights (tab)         Segmented 7d / 30d. Mood line/area chart (react-native-svg custom), top emotions chips,
                        activity counts, streak + longest, achievements grid (locked greyed), 'Sol's weekly
                        reflection' card.

 Profile (tab)          Avatar, name, goals edit, Sol's tone, Reminders, What Sol remembers (memories list with
                        delete + toggle), Privacy (delete all data), Logout, disclaimer + helplines.

 Reminders              List of reminders with toggle, time, days. Add custom reminder sheet. Test notification
                        button. Changes save to server and reschedule local notifications.




Solace AI - Implementation Plan                                                                                        15
 9. Notifications that actually work (background
 and closed)
 Use local scheduled notifications from expo-notifications. The OS delivers them even when
 the app is killed, with no server needed - the most reliable option for a demo. Optionally add server
 push for the weekly summary.

 9.1 Rules
  1. Add the expo-notifications config plugin in app.json and set an Android notification icon and
    colour.
  2. Create an Android channel at startup: setNotificationChannelAsync('reminders',
    {name:'Gentle reminders', importance: HIGH}).
  3. Set a foreground handler with setNotificationHandler so banners show while app is open.
  4. Ask permission in profile setup with a friendly pre-prompt screen (never on first launch with no
    context). On Android 13+ the system prompt is required.
  5. Schedule with a daily or weekly trigger (check current docs for the trigger type names, e.g.
    DAILY with hour/minute, WEEKLY with weekday). One reminder with several days = one weekly
    trigger per day.
  6. Every notification includes data: { url: '/checkin' } (or /breathe, /affirmation, /chat/new).
  7. Deep link handling in root _layout: (a) addNotificationResponseReceivedListener for taps
    while running/background, (b) getLastNotificationResponseAsync() once auth is ready for
    cold start from a killed app. Then router.push(data.url). Wait until the auth/redirect logic
    finished, otherwise splash overrides the route.
  8. Reschedule function syncReminders(reminders): cancel all scheduled -> schedule each
    enabled reminder. Call it after login, after any reminder change, and on app start.
  9. Gentle copy rotates (store 5 variants per type): 'How's your heart today? Sol saved you a spot.' /
    'A 2-minute breath is waiting for you.'
  10. Test on a real Android device with a development build or the APK, not only Expo Go
    (Expo Go has notification limitations, especially for push on Android). Kill the app, wait for the
    reminder, tap it, confirm it opens the right screen.


 9.2 Optional server push
  • Get token with getExpoPushTokenAsync({ projectId }) (projectId from EAS config) and PATCH
    /me.
  • Server uses expo-server-sdk + node-cron to send the weekly reflection on Sunday evening.
    Requires FCM credentials uploaded to EAS for Android.
  • If this is not working by Day 8, skip it - local notifications already satisfy the brief.




Solace AI - Implementation Plan                                                                          16
 10. Build phases with copy-paste prompts
 Each prompt assumes the agent has AGENTS.md and PLAN.md. Paste one phase at a time. Replace
 nothing unless marked.

 Phase 0 - Repository and tooling
 Goal: Monorepo, Expo app, server skeleton, git, env files.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 0. Create the monorepo described in PLAN.md section 3.2.
  1. Create folder `solace` with AGENTS.md, PLAN.md, PROGRESS.md (I will paste content).
  2. In /app run `npx create-expo-app@latest app --template` with the default
     (expo-router + TypeScript) template. Remove the template's demo screens/components.
  3. In /server: npm init, TypeScript, express, cors, helmet, dotenv, zod, mongoose,
     jsonwebtoken, bcryptjs, express-rate-limit, morgan; dev: tsx, @types/*.
     Scripts: "dev": "tsx watch src/index.ts", "build": "tsc", "start": "node dist/index.js".
  4. server/src/config/env.ts parses env with zod: PORT, MONGODB_URI, JWT_SECRET,
     GEMINI_API_KEY, GEMINI_MODEL, CORS_ORIGIN. Create .env.example.
  5. GET /api/v1/health returns {ok:true}. Connect Mongo in db.ts before listen.
  6. app/.env.example with EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:4000/api/v1
  7. Root .gitignore (node_modules, .env, dist, .expo). git init + first commit.
  Run both and tell me the exact commands to start them.



  DONE WHEN (verify every item before moving on)
  ☐ `npx expo start` opens a blank app on phone (Expo Go or dev build)
  ☐ `npm run dev` in server logs 'Mongo connected' and /health works from the phone browser via LAN IP
  ☐ tsc --noEmit passes in both



 Phase 1 - Theme, fonts, UI kit
 Goal: Design tokens and reusable components before any screens.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 1. Build the design system from PLAN.md section 7.
  - app/src/theme: colors.ts, typography.ts, spacing.ts, index.ts exactly as section 7.1/7.2.
  - Load Fraunces and Nunito via @expo-google-fonts in app/app/_layout.tsx; keep the
    native splash visible (expo-splash-screen) until fonts are loaded.
  - Install with npx expo install: react-native-reanimated, react-native-gesture-handler,
    react-native-svg, expo-linear-gradient, expo-blur, expo-haptics, expo-secure-store,
    react-native-safe-area-context. Follow each package's setup notes.
  - app/src/lib/haptics.ts: tap(), select(), success(), warn().
  - app/src/components/ui: Screen (safe area + bg + optional gradient), Text (variant prop),
    Button (primary/secondary/ghost, loading, press-scale spring + haptic), Card,
    Input (label, error, secure toggle), Chip (selectable), Skeleton (shimmer), EmptyState.
  - Temporary route /dev-kit showing every component so I can review them.



  DONE WHEN (verify every item before moving on)
  ☐ All components render on device with correct fonts
  ☐ Press animation + haptic on Button
  ☐ No hard-coded hex values outside theme



 Phase 2 - Sol mascot
 Goal: The character that gives the app its personality.




Solace AI - Implementation Plan                                                                          17
  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 2. Implement app/src/components/Sol/SolMascot.tsx per PLAN.md section 7.4 using
  react-native-svg + react-native-reanimated (use Animated components from reanimated
  with createAnimatedComponent for SVG elements).
  - Props: size (default 120), expression ('happy'|'calm'|'concerned'|'thinking'|
    'sleepy'|'excited'), tint (optional colour), breathing (default true).
  - Idle breathing scale loop, random blink every 3-6 s, expression transitions
    animated (cross-fade between mouth/eye shapes is fine).
  - 'thinking' shows 3 orbiting dots. Export also <TypingSol/> (small Sol + dots) for chat.
  - Add Sol to /dev-kit with buttons to switch expressions.
  Keep it performant: all animation on the UI thread (shared values), no setInterval
  re-renders except the blink timer.



  DONE WHEN (verify every item before moving on)
  ☐ Sol breathes and blinks smoothly at 60fps
  ☐ All 6 expressions look distinct
  ☐ No warnings in console



 Phase 3 - Auth backend
 Goal: Users, JWT, profile endpoints.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 3. Server auth per PLAN.md sections 4 and 5.
  - models/User.ts with all user fields from section 4 (passwordHash select:false).
  - routes/auth.ts: POST /auth/signup, POST /auth/login (bcrypt 10 rounds, JWT 30d,
    payload {sub:userId}). Lowercase + trim email. Generic error on bad login.
  - middleware/auth.ts sets req.userId; middleware/validate.ts (zod); middleware/error.ts.
  - routes/me.ts: GET /me, PATCH /me (zod whitelist of fields), DELETE /me (delete user
    and all docs in every collection with that userId).
  - Rate-limit /auth/* to 20 req / 15 min per IP.
  - Write a small `server/requests.http` (or curl list) to test every endpoint.



  DONE WHEN (verify every item before moving on)
  ☐ Signup -> token; login works; wrong password = 401 with friendly message
  ☐ GET /me with token returns user without passwordHash
  ☐ Duplicate email = 409



 Phase 4 - Splash, onboarding, auth screens, profile setup
 Goal: First-run journey end to end.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 4. App screens per PLAN.md section 8 rows Splash, Onboarding, Sign up/Login,
  Profile setup.
  - app/src/api/client.ts: fetch wrapper adding baseURL + Bearer token, parses
    {error:{message}}, throws ApiError; 15s timeout.
  - app/src/store/auth.ts (zustand): token, user, setSession, logout; token persisted in
    expo-secure-store. Wrap app in QueryClientProvider (@tanstack/react-query).
  - Routes: app/index.tsx (animated splash + redirect logic), (onboarding)/index.tsx,
    (auth)/login.tsx, (auth)/signup.tsx, (auth)/profile-setup.tsx (3 steps with
    progress bar; step 3 has time picker - use @react-native-community/datetimepicker
    via npx expo install; notification permission step can be a placeholder button
    for now, wired in Phase 11).
  - Remember 'onboardingSeen' in SecureStore so returning users go to login.
  - Finish profile -> PATCH /me {onboardingDone:true,...} -> router.replace('/(tabs)/home').
  Use Sol on splash, onboarding slide 2 and profile setup. Keyboard avoiding everywhere.




Solace AI - Implementation Plan                                                                18
  DONE WHEN (verify every item before moving on)
  ☐ Fresh install: splash -> onboarding -> signup -> profile setup -> home placeholder
  ☐ Kill and reopen: goes straight to home
  ☐ Logout returns to login; errors shown inline



 Phase 5 - Navigation + Home
 Goal: Tabs and the daily hub.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 5. (tabs)/_layout.tsx with 4 tabs: Home, Sol (chat list), Insights, Profile.
  Custom tab bar: floating rounded bar, icons from @expo/vector-icons, active pill
  animation, haptic on press; the centre 'Sol' tab shows a tiny Sol face.
  Server: GET /home per section 5 (affirmation + suggestion can return static
  placeholders for now; streak from user.streak; greeting by user's timezone hour).
  Home screen per section 8 'Home' using react-query, skeletons while loading,
  pull-to-refresh, staggered FadeInDown cards. Mood card opens /checkin (modal route,
  presentation:'modal' in root Stack). Quick actions route to /chat/new, /breathe,
  /journal, /plan (create simple placeholder screens for those not built yet).



  DONE WHEN (verify every item before moving on)
  ☐ Tabs switch smoothly with haptic
  ☐ Home loads real name/greeting from API with skeleton first
  ☐ All quick actions navigate somewhere (no crashes)



 Phase 6 - Mood check-in + streaks
 Goal: First real data loop.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 6. Mood check-in end-to-end.
  Server: models/Mood.ts, services/streak.ts (update user.streak using user's timezone:
  same day = no change, yesterday = +1, else reset to 1; update longest),
  models/Achievement.ts + services/achievements.ts (first_checkin, streak_3, streak_7,
  breath_5, chat_10 ...). POST /moods returns {mood, streak, solReply, achievementsUnlocked}
  (solReply: static warm line per mood for now - AI in Phase 7). GET /moods?range.
  App: /checkin modal 3 steps per section 8 with animated mood faces (SVG), emotion chips,
  note. On save: success haptic, Sol reaction bubble, streak count-up animation,
  achievement toast if unlocked, button 'Talk about it with Sol' (passes mood + note
  as params to /chat/new). Home updates instantly (invalidate 'home' query) and Sol's
  expression/tint on Home follows today's mood.



  DONE WHEN (verify every item before moving on)
  ☐ Check-in saves and appears on Home immediately
  ☐ Streak increments correctly across days (test by editing lastActiveDate in DB)
  ☐ Achievement toast shows once



 Phase 7 - AI chat backend (most important)
 Goal: Gemini integration, context, memory, safety.




Solace AI - Implementation Plan                                                                19
  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 7. Implement the AI per PLAN.md section 6 exactly.
  - npm i @google/genai. Read its README first. services/ai/gemini.ts generateJSON
    with timeout (20s) + 1 retry + kind fallback.
  - prompts.ts: SOL_SYSTEM_PROMPT and schema from 6.1/6.2, plus prompts in 6.6.
  - contextBuilder.ts (6.3), safety.ts (6.5), memoryExtractor.ts and summary/title
    logic (6.4) run async after responding (do not await in the request; catch errors).
  - models Conversation, Message, Memory.
  - Routes: all /conversations endpoints and /memories endpoints in section 5.
    POST /conversations with optional {firstMessage, seed:{mood,note}}: if seed is
    given, Sol's greeting references the check-in.
  - POST /conversations/:id/messages: save user msg -> safety check -> build context ->
    Gemini -> save assistant msg with suggestion/flag -> save chat mood if any ->
    respond -> background jobs.
  - Replace static solReply in POST /moods and placeholders in GET /home with AI
    (with caching per 6.6).
  Add `server/scripts/chatTest.ts` that runs a 6-turn conversation in terminal so we can
  judge quality without the app. Print the JSON of each reply.



  DONE WHEN (verify every item before moving on)
  ☐ chatTest shows specific, empathetic, non-generic replies, 2-4 sentences
  ☐ Suggestions appear only when relevant; anxious message -> breathing card
  ☐ After ~6 messages a memory is saved; a NEW conversation references it naturally
  ☐ Crisis phrase -> safety=true and flagged message
  ☐ Gemini key absent from app bundle



 Phase 8 - Chat UI + history
 Goal: Make the hero feature feel magical.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 8. Chat screens per PLAN.md section 8 (Chat list, Chat).
  - app/src/api/chat.ts + react-query hooks: useConversations, useMessages(id)
    (infinite, older pages), useSendMessage with OPTIMISTIC user bubble.
  - /chat/new creates a conversation (with seed params if present) then
    router.replace(`/chat/${id}`).
  - components/chat: MessageBubble (assistant with mini Sol avatar, typewriter reveal
    only for the newest assistant message), TypingSol while waiting, ActivityCard
    (maps suggestion.type to route + params: breathing -> /breathe?pattern=box&minutes=2,
    journal -> /journal?prompt=..., affirmation -> /affirmation, checkin -> /checkin),
    SupportCard for flagged messages (tel:14416, tel:112), Composer (multiline, send
    button scales in when text present, haptic), quick-reply chips on empty chat.
  - Inverted FlatList, keyboard handling that works on Android (test!).
  - Chat list: swipe-to-delete with confirm (react-native-gesture-handler Swipeable),
    rename from header menu, empty state, mood dot, relative time.
  - Retry button on failed messages.



  DONE WHEN (verify every item before moving on)
  ☐ Start new, send, get reply with typing Sol and typewriter effect
  ☐ Leave and reopen conversation: history loads, continue works
  ☐ Delete removes it from list and DB
  ☐ Activity card opens breathing with right pattern
  ☐ Keyboard never hides the composer on Android



 Phase 9 - Breathing + affirmations
 Goal: Wellness activities linked to AI.




Solace AI - Implementation Plan                                                             20
  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 9. /breathe and /affirmation per section 8.
  - Breathe: patterns box(4-4-4-4), 478(4-7-8), calm(4-6); read pattern/minutes from
    route params (expo-router useLocalSearchParams). Reanimated circle (or large Sol)
    scales with phases, phase label + countdown, soft haptic each phase change, pause,
    end early. Keep screen awake (expo-keep-awake). On finish POST /activities, show
    success with Sol 'calm' + streak/achievement.
  - Affirmation: full-screen gradient card with today's AI affirmation (GET
    /affirmations/today), 'Save' and 'Share' (React Native Share API), swipe for
    3 previous days.
  - POST /activities on server updates streak + achievements.



  DONE WHEN (verify every item before moving on)
  ☐ Breathing timing is accurate (stopwatch check)
  ☐ Launch from chat card uses card params
  ☐ Completion is recorded and shown in Insights later



 Phase 10 - Journal + wellness plan
 Goal: Reflection and a light AI plan.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 10. Journal and Plan.
  - Server: models/Journal, GET /journals/prompt (AI, cached per day), POST /journals
    (save, then generate aiReflection), GET /journals. Journal content feeds memory
    extraction (if memoryEnabled).
  - App /journal: prompt card, auto-growing text area, save -> reflection card animates
    in; list of past entries grouped by date.
  - /plan: POST /plans/generate (AI) creates a 7-day plan of tiny daily actions from
    goals + recent moods: JSON [{day, title, type, params}]. Show as a vertical timeline,
    tap to mark done (POST /activities). Keep it simple; this is P2-level.



  DONE WHEN (verify every item before moving on)
  ☐ Journal save shows a thoughtful reflection
  ☐ Plan generates 7 specific items tied to user goals



 Phase 11 - Notifications and reminders
 Goal: Functional reminders with deep links.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 11. Implement PLAN.md section 9.1 completely.
  - npx expo install expo-notifications expo-device expo-constants; add the plugin
    config + Android icon/colour in app.json.
  - app/src/lib/notifications.ts: ensureChannel(), requestPermission(), syncReminders(
    reminders) (cancel all then schedule each enabled reminder per day with the
    correct trigger type from the CURRENT expo-notifications docs), rotating copy,
    data.url on each.
  - Root _layout: foreground handler, response listener, cold-start
    getLastNotificationResponseAsync AFTER auth redirect is complete -> router.push(url).
  - Server: Reminder model + CRUD routes. On profile-setup finish create defaults:
    check-in at user's chosen time daily, affirmation 09:00, breathing 21:00 (disabled).
  - App /reminders screen per section 8; 'Send test notification' schedules one 5 s later.
  - Wire the permission step in profile setup with a friendly pre-prompt.
  Also tell me how to make a development build with EAS so I can test on Android.




Solace AI - Implementation Plan                                                              21
  DONE WHEN (verify every item before moving on)
  ☐ Test notification arrives with app in background AND after swipe-killing the app
  ☐ Tapping it opens the exact screen (checkin/breathe/affirmation)
  ☐ Changing time in Reminders reschedules (verify with getAllScheduledNotificationsAsync log)
  ☐ Toggle off = no notification



 Phase 12 - Insights, profile, memories
 Goal: Progress and user control.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 12. Insights + Profile per section 8.
  - Server GET /insights?range (aggregation: daily avg score, top emotions, activity
    counts, achievements, weeklySummary from AI cached 24h).
  - App Insights: segmented 7d/30d, custom SVG area chart with smooth curve and mood
    colour dots (animate path draw on mount), emotion chips, stats tiles, achievements
    grid, weekly reflection card with Sol.
  - Profile: edit name/goals/tone, links to Reminders and 'What Sol remembers'
    (/memories: list, delete one, delete all, memoryEnabled toggle with explanation),
    Delete my account (double confirm, DELETE /me), Logout, disclaimer + helplines.



  DONE WHEN (verify every item before moving on)
  ☐ Chart reflects real check-ins
  ☐ Deleting a memory means Sol no longer uses it
  ☐ Memory toggle off -> no new memories created



 Phase 13 - Polish pass
 Goal: What separates winners from the rest.

  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 13. Polish only, no new features. Go screen by screen and fix:
  - Every list has an empty state, every fetch has skeleton + error state with retry.
  - Every Pressable has press-scale + haptic. No layout jumps when data loads.
  - Consistent spacing using theme; text never touches screen edges; long names wrap.
  - Smooth screen transitions (Stack animation 'fade_from_bottom' or 'slide_from_right'
    consistently), modals for check-in and add-reminder.
  - Offline: show a gentle banner (@react-native-community/netinfo) and disable send.
  - Accessibility: accessibilityLabel on icon buttons, min touch size 44, contrast ok.
  - App icon + adaptive icon + splash image featuring Sol (export Sol SVG to PNG 1024).
  - Remove /dev-kit route from production, remove console.logs.
  List what you changed per screen in PROGRESS.md.



  DONE WHEN (verify every item before moving on)
  ☐ Fresh install walkthrough has zero visual glitches
  ☐ No red/yellow boxes
  ☐ Icon and splash look professional



 Phase 14 - Deploy, APK, demo
 Goal: Ship it.




Solace AI - Implementation Plan                                                                  22
  PROMPT TO PASTE INTO ANTIGRAVITY
  Phase 14. Release.
  1. Backend: deploy /server to Render (Web Service, build `npm i && npm run build`,
     start `npm start`) or Railway. Set env vars. MongoDB Atlas network access allow
     0.0.0.0/0 for the demo. Verify https://<host>/api/v1/health.
  2. App: set EXPO_PUBLIC_API_URL to the https URL in eas.json env for the 'preview'
     profile. eas.json preview: { "android": { "buildType": "apk" }, "distribution":
     "internal" }. Run `eas build -p android --profile preview`.
  3. Install the APK on a real phone and run the full checklist in section 11.
  4. Free hosts sleep: add a GET /health ping on splash so the server wakes early, and
     show a friendly 'Waking Sol up...' if the first call is slow.



  DONE WHEN (verify every item before moving on)
  ☐ APK installs and works on mobile data (not just Wi-Fi)
  ☐ All flows in section 11 pass
  ☐ Demo video recorded




Solace AI - Implementation Plan                                                          23
 11. Final end-to-end test checklist
 #     Flow                                       Expected

 1     Fresh install -> onboarding -> signup ->   No crash, permission pre-prompt, lands on Home with name
       profile setup

 2     Mood check-in                              Saved, Sol reacts (AI), streak + Home update

 3     'Talk about it' from check-in              Chat opens, Sol's first line references the check-in

 4     Chat 6+ turns about a stressful event      Specific empathetic replies, one relevant activity card

 5     Activity card                              Opens breathing with correct pattern; completion recorded

 6     New conversation next day                  Sol naturally remembers the event

 7     Chat history                               List, continue, rename, delete all work

 8     Memories screen                            Shows facts; delete works; toggle off respected

 9     Crisis phrase                              Caring reply + support card with helpline call buttons

 10    Reminders                                  Kill app -> notification arrives -> tap opens right screen

 11    Insights                                   Chart, streak, achievements, weekly reflection

 12    Logout / login on second device            Data and chats are there (server-side)

 13    Airplane mode                              Gentle offline banner, no crash



 11.1 Demo video script (3-4 minutes)
  1. 0:00 Hook: open app, splash with Sol. One line: 'Solace is a companion that remembers how you
    feel.'
  2. 0:15 Onboarding + quick signup + profile setup (goals, Sol's tone, reminder time).
  3. 0:50 Home tour: greeting, affirmation, AI suggestion, streak.
  4. 1:10 Check-in 'low, anxious - big presentation tomorrow' -> Sol reacts -> 'Talk about it'.
  5. 1:30 Chat: 3 turns, show breathing card -> do 30s of breathing with haptics.
  6. 2:10 Start a new chat: Sol asks about the presentation (memory). Open 'What Sol remembers' -
    show user control.
  7. 2:40 Chat history: continue / delete. Insights chart + achievements.
  8. 3:00 Reminders: show test notification arriving with app closed and tapping into Check-in.
  9. 3:20 Close on safety + privacy (memory toggle, delete data) and tech stack slide.




Solace AI - Implementation Plan                                                                                24
 12. Common Flash-agent pitfalls and fixes
 Problem                              Fix / what to tell the agent

 Version mismatch errors after        'Run npx expo install --check and npx expo-doctor, fix every reported
 installing packages                  issue. Do not use npm install for Expo packages.'

 Reanimated / worklets errors         Check the Reanimated version's setup for this SDK (babel plugin
                                      requirements changed between versions). 'Read the installed Reanimated
                                      version's docs and fix the babel config accordingly, then clear cache: npx
                                      expo start -c.'

 Phone cannot reach local server      Use the computer's LAN IP, not localhost; same Wi-Fi; allow port in firewall;
                                      or use `npx expo start --tunnel` and ngrok for the server.

 Agent rewrites working files         'Only modify these files: ... Show me a diff plan first.' Revert with git.

 Gemini returns invalid JSON or       Ensure responseMimeType + responseSchema set; wrap JSON.parse in
 empty                                try/catch with fallback; log raw text.

 Generic AI replies                   Strengthen prompt with 2 good/bad example pairs; check context builder
                                      actually injects moods/memories (log the final prompt).

 Notifications not firing when        Test on APK/dev build; check Android battery optimisation for the app;
 closed                               channel importance HIGH; verify scheduled list.

 Tap on notification opens Home       Cold-start handling must run after the splash redirect; store pending url in
 instead of target                    a ref and push after auth ready.

 Keyboard covers chat input on        Use KeyboardAvoidingView behavior 'padding' on iOS and app.json
 Android                              android.softwareKeyboardLayoutMode 'resize' (or
                                      react-native-keyboard-controller).

 EAS build fails                      Read the build log's first error; usually a missing env, wrong plugin config
                                      or icon path. Run `npx expo prebuild --clean` locally to reproduce.



 12.1 Security and privacy basics (quick wins)
  • All AI calls server-side; API key never in the app.
  • Passwords hashed with bcrypt; JWT secret long and random; rate limiting on auth and chat (e.g.
    30 messages/min per user).
  • Every DB query scoped by req.userId; DELETE /me wipes all user data.
  • Do not log message contents in production logs.
  • Memory is opt-out with clear explanation; user can view and delete everything Sol remembers.


  Final advice
  Finish the P0 journey end to end first (Phases 0-8 + 11), even if simple, then polish. A smooth, bug-free core
  with a memorable AI companion beats many half-working features. Good luck!




Solace AI - Implementation Plan                                                                                      25
