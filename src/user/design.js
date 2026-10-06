/**
 * @file design.js
 * @description Configures the overall logic and timeline of the experiment.
 * The timeline defines the sequence of phases that the experiment goes through.
 * This file configures which phases occur in what order.
 *
 * Inductive potential of categories, child version (run on PANDA):
 *   welcome -> sound check -> parent consent -> child consent -> window size
 *   -> hand over to child -> task intro (spoken) -> training videos (generic
 *   or specific condition; baseline skips) -> induction test -> parent form
 *   -> thanks
 *
 * The smile template's demo experiment (demographic survey, instructions quiz,
 * Stroop, favorite number/color, MTurk page, device survey, debrief) is
 * commented out below, not deleted.
 *
 * Key documentation:
 * - Views: https://smile.gureckislab.org/views.html
 * - Timeline: https://smile.gureckislab.org/timeline.html
 * - Randomization: https://smile.gureckislab.org/randomization.html
 *
 * @module design
 */

import { markRaw } from 'vue'
import { processQuery, initService } from '@/core/utils/utils'

// 1. Import main built-in View components
import AdvertisementView from '@/builtins/advertisement/AdvertisementView.vue'
// import MTurkRecruitView from '@/builtins/mturk/MTurkRecruitView.vue'
import InformedConsentView from '@/builtins/informedConsent/InformedConsentView.vue'
// import DemographicSurveyView from '@/builtins/demographicSurvey/DemographicSurveyView.vue'
// import DeviceSurveyView from '@/builtins/deviceSurvey/DeviceSurveyView.vue'
// import InstructionsView from '@/builtins/instructions/InstructionsView.vue'
// import InstructionsQuizView from '@/builtins/instructionsQuiz/InstructionsQuiz.vue'
// import DebriefView from '@/builtins/debrief/DebriefView.vue'
// import TaskFeedbackSurveyView from '@/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue'
import ThanksView from '@/builtins/thanks/ThanksView.vue'
import WithdrawView from '@/builtins/withdraw/WithdrawView.vue'
import WindowSizerView from '@/builtins/windowSizer/WindowSizerView.vue'

// 2. Import user View components
// import ExpView from '@/builtins/demoTasks/ExpView.vue'
// import FavoriteNumber from '@/builtins/demoTasks/FavoriteNumber.vue'
// import FavoriteColor from '@/builtins/demoTasks/FavoriteColor.vue'
// import StroopExpView from '@/user/components/stroop_exp/StroopExpView.vue'
import SoundCheckView from '@/user/components/zarpies/SoundCheckView.vue'
import ChildConsentView from '@/user/components/zarpies/ChildConsentView.vue'
import HandToChildView from '@/user/components/zarpies/HandToChildView.vue'
import TaskIntroView from '@/user/components/zarpies/TaskIntroView.vue'
import TrainingView from '@/user/components/zarpies/TrainingView.vue'
import InductionView from '@/user/components/zarpies/InductionView.vue'
import ParentFormView from '@/user/components/panda/ParentFormView.vue'
import { CONDITIONS } from '@/user/components/zarpies/stimuli'

// #3. Import smile API and timeline
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

import Timeline from '@/core/timeline/Timeline'
const timeline = new Timeline(api)

// #4.  Set runtime configuration options
//      See http://smile.gureckislab.org/configuration.html#experiment-options-env
api.setRuntimeConfig('allowRepeats', false)

api.setRuntimeConfig('colorMode', 'light')
api.setRuntimeConfig('responsiveUI', true)

api.setRuntimeConfig('windowsizerRequest', { width: 800, height: 600 })
api.setRuntimeConfig('windowsizerAggressive', true)

api.setRuntimeConfig('anonymousMode', false)
api.setRuntimeConfig('labURL', 'https://gureckislab.org')
api.setRuntimeConfig('brandLogoFn', 'universitylogo.png')

api.setRuntimeConfig('maxWrites', 1000)
api.setRuntimeConfig('minWriteInterval', 2000)
api.setRuntimeConfig('autoSave', true)

// api.setRuntimeConfig('payrate', '$15USD/hour prorated for estimated completition time + performance related bonus')
//
// // get rid of these two?
// api.setRuntimeConfig('estimated_time', '30-40 minutes')
// api.setRuntimeConfig('payrate', '$15USD/hour prorated for estimated completition time + performance related bonus')
api.setRuntimeConfig('estimated_time', '15-20 minutes')
api.setRuntimeConfig('payrate', 'See PANDA study listing for compensation details')

// set the informed consent text on the menu bar
import InformedConsentText from './components/InformedConsentText.vue'
api.setAppComponent('informed_consent_text', InformedConsentText)

// #5. Add between-subjects condition assignment
// Each child is randomly assigned to one of the three conditions of the adult
// study: generic (hears "Zarpies ..." training videos), specific (hears
// "This Zarpie ..." training videos) or baseline (no training videos).
// TrainingView reads this as api.getConditionByName('condition').
api.randomAssignCondition({
  condition: CONDITIONS, // ['generic', 'specific', 'baseline'], equal weights
})

// // template example: set a between-subjects condition with weights
// api.randomAssignCondition({
//   instructionsVersion: ['1', '2', '3'],
//   weights: [2, 1, 1], // weights are automatically normalized, so [4, 2, 2] would be the same
// })

// #6. Define and add some routes to the timeline
// Each route should map to a View component.
// Each needs a name
// but for most experiments they go in sequence from the begining
// to the end of this list

// by default routes have meta.requiresConsent = true (unless you manually override it)
// by default routes have meta.requiresDone = false (unless you manually override it)

// IMPORTANT: A least one route needs to be called 'welcome_anonymous'
// to handle the landing case for someone not coming from a recruitment service

// First welcome screen for non-referral (dev / anonymous entry)
timeline.pushSeqView({
  path: '/welcome',
  name: 'welcome_anonymous',
  component: AdvertisementView,
  meta: {
    prev: undefined,
    next: 'soundcheck',
    allowAlways: true,
    requiresConsent: false,
  }, // override what is next
  beforeEnter: (to) => {
    api.getBrowserFingerprint()
  },
})

// welcome screen for referral from PANDA: give PANDA the URL
// https://<deploy-host>/e/<codename>/#/welcome/panda/ and it appends ?ID=...
timeline.pushSeqView({
  path: '/welcome/:service',
  name: 'welcome_referred',
  component: AdvertisementView,
  meta: {
    prev: undefined,
    next: 'soundcheck',
    allowAlways: true,
    requiresConsent: false,
  },
  beforeEnter: (to) => {
    // handle any service-specific initialization before processing URL params
    if (initService(to.params.service) === false) return false
    // processes info to get the service-specific
    // participant info (e.g., the PANDA ID)
    processQuery(to.query, to.params.service)
    api.getBrowserFingerprint()
  },
})

// // this is a the special page that loads in the iframe on mturk.com
// timeline.registerView({
//   name: 'mturk',
//   component: MTurkRecruitView,
//   props: {
//     estimated_time: api.getConfig('estimated_time'),
//     payrate: api.getConfig('payrate'),
//   },
//   meta: { allowAlways: true, requiresConsent: false },
//   beforeEnter: (to) => {
//     processQuery(to.query, 'mturk')
//   },
// })

// sound check (parent), before the consent pages so the sound is known to
// work by the time the child assent question is read aloud. Nothing is saved
// to the database before consent: its record is uploaded once the parent
// consents.
timeline.pushSeqView({
  name: 'soundcheck',
  component: SoundCheckView,
  meta: {
    requiresConsent: false,
  },
})

// parent consent (smile's built-in consent page; text in InformedConsentText.vue)
timeline.pushSeqView({
  name: 'consent',
  component: InformedConsentView,
  props: {
    informedConsentText: markRaw(InformedConsentText), // provide the informed consent text
  },
  meta: {
    requiresConsent: false,
    setConsented: true,
  },
})

// child consent (assent), right after the parent's consent: a "no" ends the
// study on that page
timeline.pushSeqView({
  name: 'childconsent',
  component: ChildConsentView,
})

// // demographic survey
// timeline.pushSeqView({
//   name: 'demograph',
//   component: DemographicSurveyView,
// })

// windowsizer
timeline.pushSeqView({
  name: 'windowsizer',
  component: WindowSizerView,
})

// hand the laptop over to the child
timeline.pushSeqView({
  name: 'handtochild',
  component: HandToChildView,
})

// task intro video (child)
timeline.pushSeqView({
  name: 'taskintro',
  component: TaskIntroView,
})

// training videos: only for the generic and specific conditions. Baseline
// children go straight from the task intro to the induction test.
timeline.registerView({
  name: 'training',
  component: TrainingView,
})
timeline.pushConditionalNode({
  name: 'trainingByCondition',
  condition: {
    generic: ['training'],
    specific: ['training'],
    baseline: [],
  },
})

// induction test (child), ending with the hand-back-to-parent message
timeline.pushSeqView({
  name: 'induction',
  component: InductionView,
})

// // instructions
// timeline.pushSeqView({
//   name: 'instructions',
//   component: InstructionsView,
// })
//
// // import the quiz questions
// import { QUIZ_QUESTIONS } from './components/quizQuestions'
// // instructions quiz
// timeline.pushSeqView({
//   name: 'quiz',
//   component: InstructionsQuizView,
//   props: {
//     questions: QUIZ_QUESTIONS,
//     returnTo: 'instructions',
//     randomizeQandA: true,
//   },
// })
//
// // main experiment
// // note: by default, the path will be set to the name of the view
// // however, you can override this by setting the path explicitly
// timeline.pushSeqView({
//   name: 'exp',
//   path: '/experiment',
//   component: ExpView,
// })
//
// ////// example of randomized branching routes
// // (you can also have conditional branching based on conditions -- see docs)
//
// // routes must be initially registered, to tell the timeline they exist
// timeline.registerView({
//   name: 'number',
//   component: FavoriteNumber,
// })
//
// timeline.registerView({
//   name: 'color',
//   component: FavoriteColor,
// })
//
// timeline.pushRandomizedNode({
//   name: 'RandomSplit',
//   options: [['number'], ['color']],
// })
//
// // stroop exp
// timeline.pushSeqView({
//   name: 'stroop',
//   component: StroopExpView,
// })
//
// // debriefing form
// import DebriefText from '@/user/components/DebriefText.vue' // get access to the global store
// timeline.pushSeqView({
//   name: 'debrief',
//   component: DebriefView,
//   props: {
//     debriefText: markRaw(DebriefText),
//   },
// })
//
// // device survey
// timeline.pushSeqView({
//   name: 'device',
//   component: DeviceSurveyView,
// })
//
// // debriefing form
// timeline.pushSeqView({
//   name: 'feedback',
//   component: TaskFeedbackSurveyView,
//   meta: { setDone: true }, // this is the last form
// })

// --- PANDA end-of-study flow ---
// parent form (video privacy, signature, language, education, feedback);
// this is the last form, so it marks the study as done
timeline.pushSeqView({
  name: 'parentform',
  component: ParentFormView,
  meta: { setDone: true },
})

// // video upload instructions: not used, the video upload happens on the
// // PANDA platform after the data upload
// import UploadVideoView from '@/user/components/panda/UploadVideoView.vue'
// timeline.pushSeqView({
//   name: 'uploadvideo',
//   component: UploadVideoView,
//   meta: { resetApp: true },
// })

// thanks/submit page (saves the data; shows the PANDA completion message)
timeline.pushSeqView({
  name: 'thanks',
  component: ThanksView,
  meta: {
    requiresDone: true,
    resetApp: api.getConfig('allowRepeats'),
  },
})

// this is a special page that is for a withdraw
timeline.registerView({
  name: 'withdraw',
  meta: {
    requiresWithdraw: true,
    resetApp: api.getConfig('allowRepeats'),
  },
  component: WithdrawView,
})

timeline.build()

export default timeline
