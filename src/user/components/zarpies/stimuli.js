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
 * - ATTENTION_CHECK: the extra trial shuffled in with the 16 induction trials.
 *
 * The induction task is reworded for children: each trial is a spoken premise
 * and question, answered on a 5-point picture scale (SCALE_OPTIONS) instead of
 * the adult 0-100% slider. The premise frame and the scale follow the
 * within-category homogeneity measure in Benitez, Leshin & Rhodes (2022,
 * Cognition). The adult induction videos were text slides; they were deleted
 * on 2026-10-05 once the wording was confirmed. Differences from the adult
 * wording:
 *   - all trials:   "Imagine you see a Zarpie [doing X]." ->
 *                   "Now, look at this Zarpie. This Zarpie [does X]."
 *   - all trials:   "What percentage of Zarpies" -> "How many Zarpies"
 *   - potatoes:     farming / farm -> growing / grow
 *   - maple_syrup:  chugging / chug -> drinking / drink
 *   - cats:         a stray cat / stray cats -> a cat / cats
 *   - clap:         entering a room -> going into a room
 *   - look_left:    when spoken to -> when someone talks to them
 *   - attn_check:   "move the slider to 100%" -> "click on the very last picture"
 *   - opera:        replaced by `music` ("likes to listen to music"): the opera
 *                   item is too hard to picture for children (2026-10-05)
 *
 * Test pictures (images/*.png) were generated with OpenAI image generation
 * from reference Zarpies (see zarpie-stimuli/tools/imagegen). The 5 scale
 * choices are panels built from the trial's own picture, repeated 1 / 3 / 5 /
 * 7 / 9 times (SCALE_OPTIONS.count), as in Benitez, Leshin & Rhodes (2022).
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
    premise: 'Now, look at this Zarpie. This Zarpie lives in a cave.',
    question: 'How many Zarpies do you think live in caves?',
  },
  {
    id: 'lion',
    image: 'images/lion.png',
    premise: 'Now, look at this Zarpie. This Zarpie rides a lion.',
    question: 'How many Zarpies do you think ride lions?',
  },
  {
    id: 'potatoes',
    image: 'images/potatoes.png',
    premise: 'Now, look at this Zarpie. This Zarpie grows potatoes.',
    question: 'How many Zarpies do you think grow potatoes?',
  },
  {
    id: 'banjo',
    image: 'images/banjo.png',
    premise: 'Now, look at this Zarpie. This Zarpie plays the banjo.',
    question: 'How many Zarpies do you think play banjos?',
  },
  {
    id: 'look_left',
    image: 'images/look_left.png',
    premise: 'Now, look at this Zarpie. This Zarpie looks to their left when someone talks to them.',
    question: 'How many Zarpies do you think look to their left when someone talks to them?',
  },
  {
    id: 'clap',
    image: 'images/clap.png',
    premise: 'Now, look at this Zarpie. This Zarpie claps three times before going into a room.',
    question: 'How many Zarpies do you think clap three times before going into a room?',
  },
  {
    id: 'sad',
    image: 'images/sad.png',
    premise: "Now, look at this Zarpie. This Zarpie smiles when they're sad.",
    question: 'How many Zarpies do you think smile when they are sad?',
  },
  {
    id: 'maple_syrup',
    image: 'images/maple_syrup.png',
    premise: 'Now, look at this Zarpie. This Zarpie drinks maple syrup.',
    question: 'How many Zarpies do you think drink maple syrup?',
  },
  {
    id: 'cats',
    image: 'images/cats.png',
    premise: 'Now, look at this Zarpie. This Zarpie yells at a cat.',
    question: 'How many Zarpies do you think yell at cats?',
  },
  {
    id: 'music', // replaces the adult study's `opera` item (too hard to picture for children)
    image: 'images/music.png',
    premise: 'Now, look at this Zarpie. This Zarpie likes to listen to music.',
    question: 'How many Zarpies do you think like to listen to music?',
  },
  {
    id: 'dance',
    image: 'images/dance.png',
    premise: 'Now, look at this Zarpie. This Zarpie dances around a fire on their 10th birthday.',
    question: 'How many Zarpies do you think dance around a fire on their 10th birthday?',
  },
  {
    id: 'song',
    image: 'images/song.png',
    premise: 'Now, look at this Zarpie. This Zarpie sings a beautiful song.',
    question: 'How many Zarpies do you think sing beautiful songs?',
  },
  {
    id: 'window',
    image: 'images/window.png',
    premise: 'Now, look at this Zarpie. This Zarpie screams out of a window.',
    question: 'How many Zarpies do you think scream out of windows?',
  },
  {
    id: 'garbage',
    image: 'images/garbage.png',
    premise: 'Now, look at this Zarpie. This Zarpie smells garbage for fun.',
    question: 'How many Zarpies do you think smell garbage for fun?',
  },
  {
    id: 'pond',
    image: 'images/pond.png',
    premise: 'Now, look at this Zarpie. This Zarpie washes their clothes in a pond.',
    question: 'How many Zarpies do you think wash their clothes in ponds?',
  },
  {
    id: 'yellow',
    image: 'images/yellow.png',
    premise: 'Now, look at this Zarpie. This Zarpie paints their hands yellow.',
    question: 'How many Zarpies do you think paint their hands yellow?',
  },
]

// the scale, lowest to highest. On each trial the `spoken` clips are played in
// this order while the matching picture shakes; `label` is the text shown with
// the picture; `count` is how many copies of the trial's Zarpie the panel
// shows. This is the 5-point within-category homogeneity scale from
// Benitez, Leshin & Rhodes (2022, Cognition): (1) only one, (2) a few,
// (3) some, (4) most, (5) all. There is no "none": the Zarpie in the premise
// is always at least one.
export const SCALE_OPTIONS = [
  {
    id: 'one',
    count: 1, // figures shown in the scale panel
    value: 1,
    spoken: 'Is it only one Zarpie?',
    label: 'Only one Zarpie',
    audio: 'audio/scale_one.m4a',
    image: null,
  },
  {
    id: 'few',
    count: 3, // figures shown in the scale panel
    value: 2,
    spoken: 'Is it a few Zarpies?',
    label: 'A few Zarpies',
    audio: 'audio/scale_few.m4a',
    image: null,
  },
  {
    id: 'some',
    count: 5, // figures shown in the scale panel
    value: 3,
    spoken: 'Is it some Zarpies?',
    label: 'Some Zarpies',
    audio: 'audio/scale_some.m4a',
    image: null,
  },
  {
    id: 'most',
    count: 7, // figures shown in the scale panel
    value: 4,
    spoken: 'Is it most Zarpies?',
    label: 'Most Zarpies',
    audio: 'audio/scale_most.m4a',
    image: null,
  },
  {
    id: 'all',
    count: 9, // figures shown in the scale panel
    value: 5,
    spoken: 'Is it all Zarpies?',
    label: 'All Zarpies',
    audio: 'audio/scale_all.m4a',
    image: null,
  },
]

export const ATTENTION_CHECK = {
  id: 'attn_check',
  text: 'This is an attention check, kid. Please click on the very last picture.',
  audio: 'audio/attn_check.m4a',
  // TODO: a neutral Zarpie of its own; for now one of the test pictures
  image: 'images/yellow.png',
  correct: 'all', // the very last picture
}

// spoken before the first induction trial
export const INDUCTION_INTRO = {
  text: 'Now I have some questions about Zarpies. For each one, click on the picture that shows how many Zarpies you think do it. There are no right or wrong answers!',
  audio: 'audio/induction_intro.m4a',
}

// spoken after the last induction trial, handing the laptop back to the parent
export const INDUCTION_END = {
  text: 'Great job! Kid, you are all done! Please go get your grown-up.',
  audio: 'audio/induction_end.m4a',
}

// child consent (assent) page, rebuilt in code from the slide in the lab's
// standard PANDA assent video so the wording can be edited. `spoken` is read
// aloud; the YES / NO pictures are the two answers.
export const CHILD_ASSENT = {
  heading: "Perfect — now, let's hear from the kids!",
  instruction: 'Kids: Please answer the following question by clicking "yes" or "no".',
  question: 'Would you like to do this online activity with us?',
  spoken:
    "Perfect! Now, let's hear from the kids! Kids, please answer the following question by clicking yes or no. Would you like to do this online activity with us?",
  note: 'Note: If you or your child does not agree to participate, you can opt out of this study by exiting out of your browser. Your webcam will turn off, all video footage recorded up to this point will be deleted, and the file will be destroyed.',
  audio: 'audio/child_assent.m4a',
  options: [
    { id: 'yes', image: 'misc/assent_yes.svg' },
    { id: 'no', image: 'misc/assent_no.svg' },
  ],
}

export const TASK_INTRO_VIDEO = 'misc/task_intro.mp4'

// task intro text, in two versions. `adult` is the narration of the adult
// study's intro video (task_intro.mp4), word for word; `child` is the same
// content reworded for a child. Audio paths are where generated clips go.
export const TASK_INTRO = {
  adult: {
    text: 'Imagine there is a group of people called Zarpies. You will be told some information about Zarpies and be asked to make some guesses about them.',
    audio: 'audio/task_intro_adult.m4a',
  },
  child: {
    text: "Imagine there is a group of people called Zarpies. I'm going to tell you some things about Zarpies, and then ask you some questions about them.",
    audio: 'audio/task_intro_child.m4a',
  },
}

export const SOUND_CHECK = {
  audio: 'misc/sound_check.m4a', // bird sound (the adult study's video form was deleted 2026-10-05)
  options: [
    { id: 'dog', image: 'misc/soundcheck_dog.png' },
    { id: 'pig', image: 'misc/soundcheck_pig.png' },
    { id: 'cow', image: 'misc/soundcheck_cow.png' },
    { id: 'horse', image: 'misc/soundcheck_horse.png' },
    { id: 'bird', image: 'misc/soundcheck_bird.png' },
  ],
  correct: 'bird',
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
 * Induction task trials (16 features + attention check), in Qualtrics order.
 * @returns {Array<{id: string, text: string, premise?: string, question?: string, audio: {description: string|null, question: string}, image: string, attentionCheck: boolean}>}
 */
export function inductionTrials() {
  const features = INDUCTION_FEATURES.map((feature) => ({
    ...feature,
    text: `${feature.premise} ${feature.question}`,
    // two clips per trial: the description (premise) plays with the big
    // picture, then the question plays as the picture shrinks and the scale
    // appears.
    audio: {
      description: `audio/${feature.id}_description.m4a`,
      question: `audio/${feature.id}_question.m4a`,
    },
    attentionCheck: false,
  }))
  const attentionCheck = {
    ...ATTENTION_CHECK,
    audio: { description: null, question: ATTENTION_CHECK.audio }, // one clip, no description part
    attentionCheck: true,
  }
  return [...features, attentionCheck]
}

/**
 * Public URL for a stimulus asset path (video or image).
 * @param {string} path - path relative to public/stimuli/
 * @returns {string}
 */
export function stimulusUrl(path) {
  return `${import.meta.env.BASE_URL}stimuli/${path}`
}
