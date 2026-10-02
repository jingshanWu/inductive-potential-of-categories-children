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
 * and question, answered on a 4-point picture scale (SCALE_OPTIONS) instead of
 * the adult 0-100% slider. The adult induction videos (induction/*.mp4) are
 * NOT played; they are kept as the reference for the wording. Differences
 * from the adult wording:
 *   - all trials:   "What percentage of Zarpies" -> "How many Zarpies"
 *   - potatoes:     farming / farm -> growing / grow
 *   - maple_syrup:  chugging / chug -> drinking / drink
 *   - cats:         a stray cat / stray cats -> a cat / cats
 *   - clap:         entering a room -> going into a room
 *   - look_left:    when spoken to -> when someone talks to them
 *   - attn_check:   "move the slider to 100%" -> "click on the very last picture"
 *
 * Audio files (audio/*.m4a) and scale pictures are still to be made; the
 * paths below are the names the files will have.
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
    premise: 'Imagine you see a Zarpie living in a cave.',
    question: 'How many Zarpies do you think live in caves?',
  },
  {
    id: 'lion',
    premise: 'Imagine you see a Zarpie riding a lion.',
    question: 'How many Zarpies do you think ride lions?',
  },
  {
    id: 'potatoes',
    premise: 'Imagine you see a Zarpie growing potatoes.',
    question: 'How many Zarpies do you think grow potatoes?',
  },
  {
    id: 'banjo',
    premise: 'Imagine you see a Zarpie playing the banjo.',
    question: 'How many Zarpies do you think play banjos?',
  },
  {
    id: 'look_left',
    premise: 'Imagine you see a Zarpie looking to their left when someone talks to them.',
    question: 'How many Zarpies do you think look to their left when someone talks to them?',
  },
  {
    id: 'clap',
    premise: 'Imagine you see a Zarpie clapping three times before going into a room.',
    question: 'How many Zarpies do you think clap three times before going into a room?',
  },
  {
    id: 'sad',
    premise: "Imagine you see a Zarpie smiling when they're sad.",
    question: 'How many Zarpies do you think smile when they are sad?',
  },
  {
    id: 'maple_syrup',
    premise: 'Imagine you see a Zarpie drinking maple syrup.',
    question: 'How many Zarpies do you think drink maple syrup?',
  },
  {
    id: 'cats',
    premise: 'Imagine you see a Zarpie yelling at a cat.',
    question: 'How many Zarpies do you think yell at cats?',
  },
  {
    id: 'opera',
    premise: 'Imagine you see a Zarpie going to the opera.',
    question: 'How many Zarpies do you think go to the opera?',
  },
  {
    id: 'dance',
    premise: 'Imagine you see a Zarpie dancing around a fire on their 10th birthday.',
    question: 'How many Zarpies do you think dance around a fire on their 10th birthday?',
  },
  {
    id: 'song',
    premise: 'Imagine you see a Zarpie singing a beautiful song.',
    question: 'How many Zarpies do you think sing beautiful songs?',
  },
  {
    id: 'window',
    premise: 'Imagine you see a Zarpie screaming out of a window.',
    question: 'How many Zarpies do you think scream out of windows?',
  },
  {
    id: 'garbage',
    premise: 'Imagine you see a Zarpie smelling garbage for fun.',
    question: 'How many Zarpies do you think smell garbage for fun?',
  },
  {
    id: 'pond',
    premise: 'Imagine you see a Zarpie washing their clothes in a pond.',
    question: 'How many Zarpies do you think wash their clothes in ponds?',
  },
  {
    id: 'yellow',
    premise: 'Imagine you see a Zarpie painting their hands yellow.',
    question: 'How many Zarpies do you think paint their hands yellow?',
  },
]

// the scale, lowest to highest. On each trial the `spoken` clips are played in
// this order while the matching picture shakes; `label` is the text shown with
// the picture. There is no "none": the imagined Zarpie is always at least one.
export const SCALE_OPTIONS = [
  {
    id: 'one',
    value: 1,
    spoken: 'Is it only one Zarpie?',
    label: 'Only one Zarpie',
    audio: 'audio/scale_one.m4a',
    image: null,
  },
  {
    id: 'some',
    value: 2,
    spoken: 'Is it some Zarpies?',
    label: 'Some Zarpies',
    audio: 'audio/scale_some.m4a',
    image: null,
  },
  {
    id: 'most',
    value: 3,
    spoken: 'Is it most Zarpies?',
    label: 'Most Zarpies',
    audio: 'audio/scale_most.m4a',
    image: null,
  },
  {
    id: 'all',
    value: 4,
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

export const TASK_INTRO_VIDEO = 'misc/task_intro.mp4'

export const SOUND_CHECK = {
  audio: 'misc/sound_check.m4a', // bird sound, audio form
  video: 'misc/sound_check.mp4', // bird sound, video form
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
 * `video` is the adult study's video for the trial (wording reference only,
 * not played); `audio` is the child version's spoken clip.
 * @returns {Array<{id: string, text: string, premise?: string, question?: string, audio: string, video: string, attentionCheck: boolean}>}
 */
export function inductionTrials() {
  const features = INDUCTION_FEATURES.map((feature) => ({
    ...feature,
    text: `${feature.premise} ${feature.question}`,
    audio: `audio/${feature.id}.m4a`,
    video: `induction/${feature.id}.mp4`,
    attentionCheck: false,
  }))
  const attentionCheck = {
    ...ATTENTION_CHECK,
    video: `induction/${ATTENTION_CHECK.id}.mp4`,
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
