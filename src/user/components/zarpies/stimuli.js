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

export const INDUCTION_FEATURES = [
  'cave',
  'lion',
  'potatoes',
  'banjo',
  'look_left',
  'clap',
  'sad',
  'maple_syrup',
  'cats',
  'opera',
  'dance',
  'song',
  'window',
  'garbage',
  'pond',
  'yellow',
]

export const ATTENTION_CHECK = 'attn_check'

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
  // TODO: set to the id of the animal heard in sound_check.mp4
  // (the Qualtrics export does not record the correct answer)
  correct: null,
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
 * @returns {Array<{id: string, video: string, attentionCheck: boolean}>}
 */
export function inductionTrials() {
  return [...INDUCTION_FEATURES, ATTENTION_CHECK].map((id) => ({
    id,
    video: `induction/${id}.mp4`,
    attentionCheck: id === ATTENTION_CHECK,
  }))
}

/**
 * Public URL for a stimulus asset path (video or image).
 * @param {string} path - path relative to public/stimuli/
 * @returns {string}
 */
export function stimulusUrl(path) {
  return `${import.meta.env.BASE_URL}stimuli/${path}`
}
