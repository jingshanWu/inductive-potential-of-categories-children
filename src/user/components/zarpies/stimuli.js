/**
 * @file stimuli.js
 * @description Master stimulus manifest for the inductive potential study
 * (child version of Zhang, Rhodes & Ho's preregistered adult study).
 *
 * All media were downloaded from the adult Qualtrics survey
 * (Gen_to_Induc_6_prereg.qsf). Ids are the Qualtrics data export tags, so
 * they match the column names in the adult dataset. Lists are in the
 * Qualtrics question order; the views shuffle them per participant.
 *
 * - TRAINING_FEATURES: 16 features, each with a generic video ("Zarpies ...")
 *   and a matched specific video ("This Zarpie ..."), same file name in
 *   generic/ and specific/. The baseline condition sees no training videos.
 * - INDUCTION_FEATURES: 16 novel features for the inductive potential task.
 * - SCALE_TRAINING / SCALE_BRIDGE / END_CHECK: the scale warm-up before the
 *   task, the "dots = Zarpies" page before the test, and the two check
 *   questions after it (Rhodes & Liebenson, 2015); SCALE_DIRECTIONS: the
 *   counterbalanced direction of the scale.
 * - ATTENTION_CHECK: the adult study's extra trial; not shown to children
 *   (commented out in inductionTrials(), 2026-10-06).
 *
 * The induction task is reworded for children: each trial is a spoken premise
 * and question, answered on a 5-point picture scale (SCALE_OPTIONS) instead of
 * the adult 0-100% slider. The premise frame and the scale follow the
 * within-category homogeneity measure in Benitez, Leshin & Rhodes (2022,
 * Cognition). The adult induction videos were text slides; they were deleted
 * on 2026-10-05 once the wording was confirmed. Differences from the adult
 * wording (the premise keeps the adult frame, "Imagine you see a Zarpie
 * [doing X]."):
 *   - all trials:   "What percentage of Zarpies" -> "How many Zarpies"
 *   - potatoes:     farming / farm -> growing / grow
 *   - maple_syrup:  chugging / chug -> drinking / drink
 *   - cats:         a stray cat / stray cats -> a cat / cats
 *   - clap:         entering a room -> going into a room
 *   - look_left:    when spoken to -> when someone talks to them
 *   - attn_check:   "move the slider to 100%" -> "click on the very last picture"
 *   - opera:        replaced by `magic`, the adult phrase with "the opera" ->
 *                   "the magic show" ("going to the magic show" / "go to the
 *                   magic show"): the opera item is too hard to picture for
 *                   children (2026-10-06; it was `music`, "likes to listen to
 *                   music", for one day before that)
 *   - yellow:       replaced by `yellow_gloves` ("wearing yellow gloves"), in
 *                   place of painting their hands yellow (2026-10-06)
 *
 * Test pictures (images/*.png) were generated with OpenAI image generation
 * from reference Zarpies (see zarpie-stimuli/tools/imagegen). The 5 scale
 * choices are panels built from the trial's own picture, repeated 1 / 3 / 5 /
 * 7 / 9 times (SCALE_OPTIONS.count), as in Benitez, Leshin & Rhodes (2022).
 *
 * Pace: on 2026-10-07 the clips were brought to one pace within each group
 * (questions about 0.19-0.23 s per syllable, that of song_question; premises a
 * little quicker, about 0.15-0.19), with no pauses inside a sentence and a
 * falling ending, by picking among several takes. Some are takes at a slower
 * speaking rate (questions: cave, magic, potatoes, yellow_gloves, sad at 0.9;
 * premises: magic at 0.9, cave at 0.85). generate_stimuli.py makes clips at
 * the normal rate only, so a regenerated clip may need re-picking.
 *
 * Loudness: the training videos are the reference. scripts/tts/match_loudness.py
 * brings every spoken clip to their level; run it after regenerating any clip.
 *
 * Only this study's own stimuli are listed here. The lab's standard pages
 * (welcome, sound check, consent, ...) and their pictures and sounds are in
 * src/builtins/cdsc_default and src/assets/cdsc_default.
 *
 * Asset paths are relative to public/stimuli/.
 */

export const CONDITIONS = ['generic', 'specific', 'baseline']

export const TRAINING_FEATURES = [
  'eat_flowers',
  'stripes_hair',
  'bounce_ball_head',
  'like_sing',
  'climb_fences',
  'flap_arms_happy',
  'freckles_feet',
  'hop_puddles',
  'dont_like_mud',
  'draw_stars_knees',
  'can_flip_air',
  'scared_ladybugs',
  'dont_like_icecream',
  'chase_shadows',
  'babies_blankets',
  'sleep_trees',
]

// premise + question are read aloud together in one audio clip per trial
export const INDUCTION_FEATURES = [
  {
    id: 'cave',
    image: 'images/cave.png',
    premise: 'Imagine you see a Zarpie living in a cave.',
    question: 'How many Zarpies do you think live in caves?',
  },
  {
    id: 'lion',
    image: 'images/lion.png',
    premise: 'Imagine you see a Zarpie riding a lion.',
    question: 'How many Zarpies do you think ride lions?',
  },
  {
    id: 'potatoes',
    image: 'images/potatoes.png',
    premise: 'Imagine you see a Zarpie growing potatoes.',
    question: 'How many Zarpies do you think grow potatoes?',
  },
  {
    id: 'banjo',
    image: 'images/banjo.png',
    premise: 'Imagine you see a Zarpie playing the banjo.',
    question: 'How many Zarpies do you think play banjos?',
  },
  {
    id: 'look_left',
    image: 'images/look_left.png',
    premise: 'Imagine you see a Zarpie looking to their left when someone talks to them.',
    question: 'How many Zarpies do you think look to their left when someone talks to them?',
  },
  {
    id: 'clap',
    image: 'images/clap.png',
    premise: 'Imagine you see a Zarpie clapping three times before going into a room.',
    question: 'How many Zarpies do you think clap three times before going into a room?',
  },
  {
    id: 'sad',
    image: 'images/sad.png',
    premise: "Imagine you see a Zarpie smiling when they're sad.",
    question: 'How many Zarpies do you think smile when they are sad?',
  },
  {
    id: 'maple_syrup',
    image: 'images/maple_syrup.png',
    premise: 'Imagine you see a Zarpie drinking maple syrup.',
    question: 'How many Zarpies do you think drink maple syrup?',
  },
  {
    id: 'cats',
    image: 'images/cats.png',
    premise: 'Imagine you see a Zarpie yelling at a cat.',
    question: 'How many Zarpies do you think yell at cats?',
  },
  {
    id: 'magic', // replaces the adult study's `opera` item (too hard to picture for children)
    image: 'images/magic.png',
    premise: 'Imagine you see a Zarpie going to the magic show.',
    question: 'How many Zarpies do you think go to the magic show?',
  },
  {
    id: 'dance',
    image: 'images/dance.png',
    premise: 'Imagine you see a Zarpie dancing around a fire on their 10th birthday.',
    question: 'How many Zarpies do you think dance around a fire on their 10th birthday?',
  },
  {
    id: 'song',
    image: 'images/song.png',
    premise: 'Imagine you see a Zarpie singing a beautiful song.',
    question: 'How many Zarpies do you think sing beautiful songs?',
  },
  {
    id: 'window',
    image: 'images/window.png',
    premise: 'Imagine you see a Zarpie screaming out of a window.',
    question: 'How many Zarpies do you think scream out of windows?',
  },
  {
    id: 'garbage',
    image: 'images/garbage.png',
    premise: 'Imagine you see a Zarpie smelling garbage for fun.',
    question: 'How many Zarpies do you think smell garbage for fun?',
  },
  {
    id: 'pond',
    image: 'images/pond.png',
    premise: 'Imagine you see a Zarpie washing their clothes in a pond.',
    question: 'How many Zarpies do you think wash their clothes in ponds?',
  },
  {
    id: 'yellow_gloves', // replaces the adult study's `yellow` item (painting their hands yellow)
    image: 'images/yellow_gloves.png',
    premise: 'Imagine you see a Zarpie wearing yellow gloves.',
    question: 'How many Zarpies do you think wear yellow gloves?',
  },
]

// the scale, lowest to highest. On each trial the `spoken` clips are played in
// this order while the matching picture shakes (written with a period, not a
// question mark, so the voice does not rise at the end); `label` is the text shown with
// the picture; `speakingRate` (optional) slows the generated voice for that
// clip (1 = normal). Each choice stays enlarged for the same time, whatever
// the length of its clip (SCALE_SLOT_MS in InductionView.vue): `leadMs`
// (optional) of silence, the clip, then silence for the rest of the time. `count` is how
// many copies of the trial's Zarpie the panel shows. This is the 5-point within-category homogeneity scale from
// Benitez, Leshin & Rhodes (2022, Cognition): (1) only one, (2) a few,
// (3) some, (4) most, (5) all. There is no "none": the Zarpie in the premise
// is always at least one.
export const SCALE_OPTIONS = [
  {
    id: 'one',
    count: 1, // figures shown in the scale panel
    value: 1,
    spoken: 'Only one Zarpie.',
    label: 'Only one Zarpie',
    audio: 'audio/scale_one.m4a',
    // when the scale runs all -> one, this is the last option: "or" marks it
    last: { spoken: 'Or only one Zarpie.', audio: 'audio/scale_one_last.m4a' },
    speakingRate: 0.95, // all 5 scale clips at this rate, so they match
    image: null,
  },
  {
    id: 'few',
    count: 3, // figures shown in the scale panel
    value: 2,
    spoken: 'A few Zarpies.',
    label: 'A few Zarpies',
    audio: 'audio/scale_few.m4a',
    speakingRate: 0.9, // a little slower than 0.95: a take that starts lower and holds 'few'
    image: null,
  },
  {
    id: 'some',
    count: 5, // figures shown in the scale panel
    value: 3,
    spoken: 'Some Zarpies.',
    label: 'Some Zarpies',
    audio: 'audio/scale_some.m4a',
    leadMs: 300, // silence between the choice enlarging and its clip
    // made with the promptable model (gemini-2.5-flash-tts, same voice name), asked for a
    // brief statement with a slight stress on 'some'; generate_stimuli.py cannot remake it
    image: null,
  },
  {
    id: 'most',
    count: 7, // figures shown in the scale panel
    value: 4,
    spoken: 'Most Zarpies.',
    label: 'Most Zarpies',
    audio: 'audio/scale_most.m4a',
    leadMs: 300, // silence between the choice enlarging and its clip
    speakingRate: 0.95, // all 5 scale clips at this rate, so they match
    image: null,
  },
  {
    id: 'all',
    count: 9, // figures shown in the scale panel
    value: 5,
    spoken: 'Or all Zarpies.', // "or" marks the last option
    label: 'All Zarpies',
    audio: 'audio/scale_all.m4a',
    // when the scale runs all -> one, this is the first option: no "or"
    first: { spoken: 'All Zarpies.', audio: 'audio/scale_all_first.m4a' },
    speakingRate: 0.95, // all 5 scale clips at this rate, so they match
    image: null,
  },
]

export const ATTENTION_CHECK = {
  id: 'attn_check',
  text: 'This is an attention check, kid. Please click on the very last picture.',
  audio: 'audio/attn_check.m4a',
  // TODO: a neutral Zarpie of its own; for now one of the test pictures
  image: 'images/yellow_gloves.png',
  correct: 'all', // the very last picture
}

// The direction of the scale on screen, counterbalanced across children (as
// in Rhodes & Liebenson, 2015): 'oneToAll' shows "only one" on the left and
// "all" on the right, 'allToOne' the reverse. It is drawn once per child
// (design.js) and used everywhere the scale appears: the scale training, the
// test and the end check.
export const SCALE_DIRECTIONS = ['oneToAll', 'allToOne']

/**
 * The scale options in the order they are shown and read for a direction,
 * with the clip to read for each ("or" marks the last option in either
 * direction).
 * @param {string} direction - 'oneToAll' or 'allToOne'
 * @returns {Array<object>} SCALE_OPTIONS entries with `audio` resolved
 */
export function scaleOptions(direction) {
  const options = direction === 'allToOne' ? [...SCALE_OPTIONS].reverse() : [...SCALE_OPTIONS]
  return options.map((option, i) => {
    const alt = i === 0 ? option.first : i === options.length - 1 ? option.last : null
    return alt ? { ...option, spoken: alt.spoken, audio: alt.audio } : option
  })
}

// Scale training, the first thing the child does (as in Rhodes & Liebenson,
// 2015, where it came before the category was introduced): the lab's warm-up script (Rhodes &
// Liebenson, 2015, Study 1 "Warm Up Scripts", with the one-to-all scale of
// Diversity Study 2 "Creation3_ScaleTraining"), adapted for the screen: the
// child clicks a card instead of pointing, and the voice does what the
// experimenter did. The cards show dots (1 / 3 / 5 / 7 / 9), as in the lab;
// the practice questions are about kids, so nothing is taught about Zarpies.
// Order of the practice items as in the lab script: only one, all, some,
// most, a few. A wrong click gets the lab's gentle correction and the child
// clicks the right card to go on.
export const SCALE_TRAINING = {
  speakingRate: 0.85, // all its clips: a little slower than the voice's normal pace, for children
  dot: 'images/dot.png',
  intro: {
    text: "Let's first practice how to respond to questions.",
    audio: 'audio/training_intro2.m4a',
  },
  // one clip per card, read in the order of the scale on screen, each as its
  // card enlarges
  cards: {
    one: {
      text: "See how this picture has just one dot? This picture means 'only one'.",
      audio: 'audio/training_card_one.m4a',
    },
    few: {
      text: "See how this picture has only a few dots? This picture means 'a few'.",
      audio: 'audio/training_card_few.m4a',
    },
    some: {
      text: "See how this picture has some dots? This picture means 'some'.",
      audio: 'audio/training_card_some.m4a',
    },
    most: {
      text: "See how this picture is mostly full of dots? This picture means 'most'.",
      audio: 'audio/training_card_most.m4a',
    },
    all: {
      text: "See how this picture is all full of dots? This picture means 'all'.",
      audio: 'audio/training_card_all.m4a',
    },
  },
  // after each practice question the cards are read in one clip, in the order
  // of the scale on screen (periods, so the voice pauses between them), each
  // card enlarging as its word comes (`cues`:
  // seconds into the clip at which each word starts, measured from the clip
  // by scripts/tts/scale_cues.py; run it after regenerating these clips)
  options: {
    oneToAll: {
      text: 'Only one. A few. Some. Most. Or all.',
      audio: 'audio/training_options_one_to_all.m4a',
      cues: [0.04, 1.16, 2.33, 3.47, 4.74],
    },
    allToOne: {
      text: 'All. Most. Some. A few. Or only one.',
      audio: 'audio/training_options_all_to_one.m4a',
      cues: [0.08, 1.08, 2.34, 3.25, 4.37],
    },
  },
  practiceIntro: {
    text: "Let's practice using these cards. For each question, click on the card that shows your answer.",
    audio: 'audio/training_practice_intro.m4a',
  },
  // After a wrong click: the `youThink` clip for the card the child clicked
  // ("You think most kids like to go swimming?"), then `wrongGood` ("That's a
  // good answer."), then `wrongRest`; the right card then enlarges.
  items: [
    {
      id: 'fingers',
      correct: 'one',
      image: 'images/hand_one_finger.png',
      question: {
        text: 'Look at this hand. How many fingers is it holding up?',
        audio: 'audio/training_q_fingers.m4a',
      },
      right: {
        text: "That's right! Just one. So this card with just one dot means only one.",
        audio: 'audio/training_right_fingers.m4a',
      },
      youThink: {
        one: { text: "You think it's holding up only one finger?", audio: 'audio/training_youthink_fingers_one.m4a' },
        few: { text: "You think it's holding up a few fingers?", audio: 'audio/training_youthink_fingers_few.m4a' },
        some: { text: "You think it's holding up some fingers?", audio: 'audio/training_youthink_fingers_some.m4a' },
        most: {
          text: "You think it's holding up most of its fingers?",
          audio: 'audio/training_youthink_fingers_most.m4a',
        },
        all: {
          text: "You think it's holding up all of its fingers?",
          audio: 'audio/training_youthink_fingers_all.m4a',
        },
      },
      wrongRest: {
        text: 'But you know what, this hand is holding up just one finger. So can you click the card that has just one dot?',
        audio: 'audio/training_wrong_fingers.m4a',
      },
    },
    {
      id: 'birthdays',
      correct: 'all',
      image: 'images/birthday_cake.png',
      question: { text: 'How many kids have a birthday?', audio: 'audio/training_q_birthdays.m4a' },
      right: {
        text: "Yes, that's right, all kids have a birthday! So this card that's all filled up with dots means all.",
        audio: 'audio/training_right_birthdays.m4a',
      },
      youThink: {
        one: { text: 'You think only one kid has a birthday?', audio: 'audio/training_youthink_birthdays_one.m4a' },
        few: { text: 'You think a few kids have a birthday?', audio: 'audio/training_youthink_birthdays_few.m4a' },
        some: { text: 'You think some kids have a birthday?', audio: 'audio/training_youthink_birthdays_some.m4a' },
        most: { text: 'You think most kids have a birthday?', audio: 'audio/training_youthink_birthdays_most.m4a' },
        all: { text: 'You think all kids have a birthday?', audio: 'audio/training_youthink_birthdays_all.m4a' },
      },
      wrongRest: {
        text: 'But you know what, all kids have a birthday. So can you click the card that is all filled up with dots?',
        audio: 'audio/training_wrong_birthdays.m4a',
      },
    },
    {
      id: 'girls',
      correct: 'some',
      image: 'images/kids_group.png',
      question: { text: 'How many kids are girls?', audio: 'audio/training_q_girls.m4a' },
      right: {
        text: "That's right, some kids are girls and some are boys. So this card means some.",
        audio: 'audio/training_right_girls.m4a',
      },
      youThink: {
        one: { text: 'You think only one kid is a girl?', audio: 'audio/training_youthink_girls_one.m4a' },
        few: { text: 'You think a few kids are girls?', audio: 'audio/training_youthink_girls_few.m4a' },
        some: { text: 'You think some kids are girls?', audio: 'audio/training_youthink_girls_some.m4a' },
        most: { text: 'You think most kids are girls?', audio: 'audio/training_youthink_girls_most.m4a' },
        all: { text: 'You think all kids are girls?', audio: 'audio/training_youthink_girls_all.m4a' },
      },
      wrongRest: {
        text: 'But you know what, some kids are girls and some are boys. So can you click the card that shows some?',
        audio: 'audio/training_wrong_girls.m4a',
      },
    },
    {
      id: 'swimming',
      correct: 'most',
      image: 'images/swimming.png',
      question: { text: 'How many kids like to go swimming?', audio: 'audio/training_q_swimming.m4a' },
      right: {
        text: "That's right, most kids like to go swimming, but a few kids might not. So this card means most.",
        audio: 'audio/training_right_swimming.m4a',
      },
      youThink: {
        one: {
          text: 'You think only one kid likes to go swimming?',
          audio: 'audio/training_youthink_swimming_one.m4a',
        },
        few: { text: 'You think a few kids like to go swimming?', audio: 'audio/training_youthink_swimming_few.m4a' },
        some: { text: 'You think some kids like to go swimming?', audio: 'audio/training_youthink_swimming_some.m4a' },
        most: { text: 'You think most kids like to go swimming?', audio: 'audio/training_youthink_swimming_most.m4a' },
        all: { text: 'You think all kids like to go swimming?', audio: 'audio/training_youthink_swimming_all.m4a' },
      },
      wrongRest: {
        text: 'But you know what, I think most kids like to go swimming. So can you click the card that shows most?',
        audio: 'audio/training_wrong_swimming.m4a',
      },
    },
    {
      id: 'brothers',
      correct: 'few',
      image: 'images/baby_brother.png',
      question: { text: 'How many kids have a baby brother?', audio: 'audio/training_q_brothers.m4a' },
      right: {
        text: "That's right! Kids can have an older brother, an older sister, a baby sister, or a baby brother. So only a few kids have a baby brother. This card means a few.",
        audio: 'audio/training_right_brothers.m4a',
      },
      youThink: {
        one: { text: 'You think only one kid has a baby brother?', audio: 'audio/training_youthink_brothers_one.m4a' },
        few: { text: 'You think a few kids have a baby brother?', audio: 'audio/training_youthink_brothers_few.m4a' },
        some: { text: 'You think some kids have a baby brother?', audio: 'audio/training_youthink_brothers_some.m4a' },
        most: { text: 'You think most kids have a baby brother?', audio: 'audio/training_youthink_brothers_most.m4a' },
        all: { text: 'You think all kids have a baby brother?', audio: 'audio/training_youthink_brothers_all.m4a' },
      },
      wrongRest: {
        text: 'But you know what, only a few kids have a baby brother. So can you click the card that shows a few?',
        audio: 'audio/training_wrong_brothers.m4a',
      },
    },
  ],
  wrongGood: { text: "That's a good answer.", audio: 'audio/training_wrong_good.m4a' },
  end: { text: "Great! Now let's begin.", audio: 'audio/training_end.m4a' },
}

// Page 2 of the task intro (TaskIntroView.vue): the Zarpie pictures of the
// test mean the same thing as the dot cards of the scale training. One line,
// over the dot cards and the Zarpie panels. (Was its own view,
// ScaleBridgeView.vue, that also named the five panels one by one; that view
// is commented out in design.js and may be deleted later.)
export const SCALE_BRIDGE = {
  speakingRate: 0.85, // as the scale training

  image: 'images/neutral.png', // a Zarpie with no special feature, for the 5 panels
  intro: {
    text: 'In the questions, the cards will show Zarpies instead of dots, but they mean the same thing.',
    audio: 'audio/training_bridge_intro2.m4a',
  },
}

// Two check questions after the last test trial, to show the child can use
// the scale: the control questions of Rhodes & Liebenson (2015) with Zarpies
// in place of birds, one that should land at the low end and one higher up.
// On the Zarpie panels, no feedback, answers recorded.
export const END_CHECK = {
  speakingRate: 0.85, // as the scale training
  intro: { text: 'Now, two more questions.', audio: 'audio/endcheck_intro.m4a' },
  image: 'images/neutral.png', // the Zarpie shown with each question, and in the 5 panels
  // the questions are told about a boy, Steve (third person), rather than by
  // the voice about itself
  narrator: { name: 'Steve', image: 'images/steve.png' },
  items: [
    {
      id: 'met_one',
      expected: 'one',
      question: {
        text: 'This is Steve. And here is a Zarpie. Steve met this Zarpie yesterday. Steve only met this one Zarpie. Now tell me your best guess: of all the Zarpies in the world, how many Zarpies did Steve meet yesterday?',
        audio: 'audio/endcheck_q_met_one.m4a',
        // Steve is on screen from the start; the Zarpie appears when the
        // voice gets to "And here is a Zarpie": seconds into the clip, the
        // end of the pause after "This is Steve." (measured from the clip the
        // way scripts/tts/scale_cues.py measures the scale words; re-measure
        // if the clip is regenerated)
        zarpieAt: 2.1,
      },
    },
    {
      id: 'girls',
      expected: null, // some or most; no single right answer
      question: {
        text: 'Here is a Zarpie. This Zarpie is a girl. Now tell me your best guess: of all the Zarpies in the world, how many Zarpies are girls?',
        audio: 'audio/endcheck_q_girls.m4a',
      },
    },
  ],
}

// spoken before the first induction trial
export const INDUCTION_INTRO = {
  text: 'For each question, click on the picture that shows how many Zarpies you think do it. There are no right or wrong answers!',
  audio: 'audio/induction_intro.m4a',
}

// task intro text, in two versions. `adult` is the narration of the adult
// study's intro video, word for word; `child` is the same
// content reworded for a child. Audio paths are where generated clips go.
// TaskIntroView picks which version the child sees and hears.
export const TASK_INTRO = {
  adult: {
    text: 'Imagine there is a group of people called Zarpies. You will be told some information about Zarpies and be asked to make some guesses about them.',
    audio: 'audio/task_intro_adult.m4a',
  },
  child: {
    text: "Imagine there is a group of people called Zarpies. Zarpies live in a place far, far away. I'm going to tell you some things about Zarpies, and ask you some questions about them.",
    audio: 'audio/task_intro_child.m4a',
  },
}

/**
 * Training videos for a condition, in Qualtrics order.
 * @param {string} condition - 'generic', 'specific' or 'baseline'
 * @returns {Array<{id: string, video: string}>} empty for baseline
 */
export function trainingTrials(condition) {
  if (condition === 'baseline') return []
  return TRAINING_FEATURES.map((id) => ({ id, video: `${condition}/${id}.mp4` }))
}

/**
 * Induction task trials (16 features; the attention check is commented out),
 * in Qualtrics order.
 * @returns {Array<{id: string, text: string, premise?: string, question?: string, audio: {description: string|null, question: string}, image: string, attentionCheck: boolean}>}
 */
export function inductionTrials() {
  const features = INDUCTION_FEATURES.map((feature) => ({
    ...feature,
    text: `${feature.premise} ${feature.question}`,
    // two clips per trial: the description (premise) plays with the big
    // picture, then the picture goes away and the question plays as the scale
    // appears.
    audio: {
      description: `audio/${feature.id}_description.m4a`,
      question: `audio/${feature.id}_question.m4a`,
    },
    attentionCheck: false,
  }))
  // no attention check for children (2026-10-06)
  // const attentionCheck = {
  //   ...ATTENTION_CHECK,
  //   audio: { description: null, question: ATTENTION_CHECK.audio }, // one clip, no description part
  //   attentionCheck: true,
  // }
  // return [...features, attentionCheck]
  return features
}

/**
 * Everything the child will hear and see, from the scale training to the end
 * check, to fetch ahead of time: the browser then serves each clip, picture
 * and video from its cache when its page needs it (on the live site a scale
 * clip once took ~7 s to arrive in the middle of a trial). About 25 MB for
 * one condition. Called from the welcome page (design.js), so the whole
 * parent part is available for the download; the scale training and task
 * intro call inductionAssetUrls() again as a safety net (cached: cheap).
 * @param {string} condition - 'generic', 'specific' or 'baseline' (the
 *   training videos of that condition are included)
 * @returns {Array<string>} urls
 */
export function studyAssetUrls(condition) {
  const videos = trainingTrials(condition).map((t) => stimulusUrl(t.video))
  return [stimulusUrl(TASK_INTRO.child.audio), ...videos, ...inductionAssetUrls()]
}

/**
 * Every sound and picture of the scale training, the induction task and the
 * end check, as URLs, to fetch ahead of time. On the live site a clip is only downloaded when it is about to play,
 * and the first scale clip once stalled a trial for several seconds on a slow
 * connection; fetching them early puts them in the browser's cache.
 * @returns {string[]}
 */
export function inductionAssetUrls() {
  const paths = [INDUCTION_INTRO.audio, ...SCALE_OPTIONS.flatMap((o) => [o.audio, o.first?.audio, o.last?.audio])]
  const T = SCALE_TRAINING
  paths.push(
    T.dot,
    T.intro.audio,
    T.practiceIntro.audio,
    T.wrongGood.audio,
    SCALE_BRIDGE.image,
    SCALE_BRIDGE.intro.audio,
    T.end.audio
  )
  paths.push(...Object.values(T.cards).map((c) => c.audio))
  paths.push(...Object.values(T.options).map((c) => c.audio))
  for (const it of T.items) {
    paths.push(it.image, it.question.audio, it.right.audio, it.wrongRest.audio)
    paths.push(...Object.values(it.youThink).map((c) => c.audio))
  }
  paths.push(
    END_CHECK.intro.audio,
    END_CHECK.image,
    END_CHECK.narrator.image,
    ...END_CHECK.items.map((it) => it.question.audio)
  )
  for (const trial of inductionTrials()) {
    paths.push(trial.image, trial.audio.description, trial.audio.question)
  }
  return paths.filter(Boolean).map(stimulusUrl)
}

/**
 * Public URL for a stimulus asset path (video or image).
 * @param {string} path - path relative to public/stimuli/
 * @returns {string}
 */
export function stimulusUrl(path) {
  return `${import.meta.env.BASE_URL}stimuli/${path}`
}
