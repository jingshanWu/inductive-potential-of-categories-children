/**
 * @file design.js
 * @description Configures the overall logic and timeline of the experiment.
 * The timeline defines the sequence of phases that the experiment goes through.
 * This file configures which phases occur in what order.
 *
 * Inductive potential of categories, child version (run on PANDA):
 *   welcome -> sound check -> window size -> intro -> parent consent
 *   -> child consent -> hand over to child -> task intro (spoken) -> training
 *   videos (generic or specific condition; baseline skips) -> induction test
 *   -> "GREAT job!" hand-back page -> parent form -> data upload and the lab's closing page
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
// Smile's default welcome page; this study uses the lab's (CDSC) default instead
// import AdvertisementView from '@/builtins/advertisement/AdvertisementView.vue'
import WelcomeView from '@/builtins/cdsc_default/WelcomeView.vue'
// import MTurkRecruitView from '@/builtins/mturk/MTurkRecruitView.vue'
// Smile's default consent page; this study uses the lab's (CDSC) consent slides instead
// import InformedConsentView from '@/builtins/informedConsent/InformedConsentView.vue'
import ParentConsentView from '@/builtins/cdsc_default/ParentConsentView.vue'
// import DemographicSurveyView from '@/builtins/demographicSurvey/DemographicSurveyView.vue'
// import DeviceSurveyView from '@/builtins/deviceSurvey/DeviceSurveyView.vue'
// import InstructionsView from '@/builtins/instructions/InstructionsView.vue'
// import InstructionsQuizView from '@/builtins/instructionsQuiz/InstructionsQuiz.vue'
// import DebriefView from '@/builtins/debrief/DebriefView.vue'
// import TaskFeedbackSurveyView from '@/builtins/taskFeedbackSurvey/TaskFeedbackSurveyView.vue'
// Smile's default thanks page; this study uses the lab's (CDSC) last page instead
// import ThanksView from '@/builtins/thanks/ThanksView.vue'
import EndView from '@/builtins/cdsc_default/EndView.vue'
import WithdrawView from '@/builtins/withdraw/WithdrawView.vue'
import WindowSizerView from '@/builtins/windowSizer/WindowSizerView.vue'

// 2. Import user View components
// import ExpView from '@/builtins/demoTasks/ExpView.vue'
// import FavoriteNumber from '@/builtins/demoTasks/FavoriteNumber.vue'
// import FavoriteColor from '@/builtins/demoTasks/FavoriteColor.vue'
// import StroopExpView from '@/user/components/stroop_exp/StroopExpView.vue'
import SoundCheckView from '@/builtins/cdsc_default/SoundCheckView.vue'
import IntroVideoView from '@/builtins/cdsc_default/IntroVideoView.vue'
import ChildConsentView from '@/builtins/cdsc_default/ChildConsentView.vue'
import MouseInstructionsView from '@/builtins/cdsc_default/MouseInstructionsView.vue'
import PreParentView from '@/builtins/cdsc_default/PreParentView.vue'
import TaskIntroView from '@/user/components/zarpies/TaskIntroView.vue'
import TrainingView from '@/user/components/zarpies/TrainingView.vue'
import InductionView from '@/user/components/zarpies/InductionView.vue'
import ParentFormView from '@/builtins/cdsc_default/ParentFormView.vue'
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

api.setRuntimeConfig('windowsizerRequest', { width: 1000, height: 600 })
api.setRuntimeConfig('windowsizerAggressive', true)

api.setRuntimeConfig('anonymousMode', false)
api.setRuntimeConfig('labURL', 'https://gureckislab.org')
api.setRuntimeConfig('brandLogoFn', 'universitylogo.png')

// Fast forward, for developing and testing (development mode only): every
// clip and video counts as played at once, so every page can be clicked
// through without waiting. Uncomment to switch on; comment out (or delete)
// for the normal study. See src/uikit/components/cdsc/fastForward.js.
// api.setRuntimeConfig('fastForward', true)

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
// the text behind the "View consent" button in the top bar: the lab's consent
// (Smile's template text is still in ./components/InformedConsentText.vue, unused)
// import InformedConsentText from './components/InformedConsentText.vue'
import ConsentText from '@/uikit/components/cdsc/ConsentText.vue'
api.setAppComponent('informed_consent_text', ConsentText)

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
  component: WelcomeView,
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
  component: WelcomeView,
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

// window size check, right after the sound check (before consent, so it
// does not require consent)
timeline.pushSeqView({
  name: 'windowsizer',
  component: WindowSizerView,
  meta: {
    requiresConsent: false,
  },
})

// the lab's PANDA intro (parent), between the window size check and consent
timeline.pushSeqView({
  name: 'introvideo',
  component: IntroVideoView,
  meta: {
    requiresConsent: false,
  },
})

// parent consent: the lab's consent slides, one per page, ending with the
// "I consent" button (study-specific wording in components/consentStudyInfo.js)
timeline.pushSeqView({
  name: 'consent',
  component: ParentConsentView,
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

// hand the laptop over to the child
timeline.pushSeqView({
  name: 'handtochild',
  component: MouseInstructionsView,
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

// the lab's "GREAT job!" page, shown as soon as the child answers the last
// test trial: hands the laptop back to the parent
timeline.pushSeqView({
  name: 'preparent',
  component: PreParentView,
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

// last page (saves the data, then the lab's "HANG ON! ... upload the video"
// and thank-you message)
timeline.pushSeqView({
  name: 'thanks',
  component: EndView,
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
