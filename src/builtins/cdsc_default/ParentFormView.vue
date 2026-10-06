<script setup>
/**
 * ParentFormView Component (CDSC default)
 *
 * End-of-study parent form for PANDA studies, adapted from the smile template
 * to match the lab's standard child-study questions (the "panda demographics"
 * and "feedback" blocks of the lab's Qualtrics child studies), collecting:
 * - Video privacy settings (lab researchers only vs. shareable excerpts)
 * - Digital signature for the privacy settings, via vue-signature-pad
 * - Primary language spoken to the child at home
 * - Parent's highest level of education
 * - Problems or confusion with the task
 *
 * The template's how-did-you-find-us checkboxes are not used in this study
 * (commented out below).
 *
 * This is typically the route with `setDone: true` in the timeline.
 */

// import { reactive, computed, ref, onMounted, onUnmounted } from 'vue'
import { reactive, computed, ref } from 'vue'

import useViewAPI from '@/core/composables/useViewAPI'
import { Button } from '@/uikit/components/ui/button'
// import { Checkbox } from '@/uikit/components/ui/checkbox' // how-did-you-find-us only
// import { Label } from '@/uikit/components/ui/label' // how-did-you-find-us only
import { Input } from '@/uikit/components/ui/input'
import { Textarea } from '@/uikit/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/uikit/components/ui/select'
import { TitleTwoCol, ConstrainedPage } from '@/uikit/layouts'
import { VueSignaturePad } from 'vue-signature-pad'

const api = useViewAPI()

// answer options, in the lab's wording
const PRIVACY_OPTIONS = [
  {
    value: 'lab_only',
    text: 'I prefer for the video to remain accessible only to lab researchers and never shared with other researchers.',
  },
  {
    value: 'share_excerpts',
    text: 'I give permission for lab researchers to share selected video excerpts and images from this session for scientific presentations and informational/educational purposes, and never for commercial purposes.',
  },
]
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Mandarin', 'Other (please specify)']
const LANGUAGE_OTHER = 'Other (please specify)'
const EDUCATION_OPTIONS = [
  'Less than high school',
  'High school/GED',
  'Some college',
  "Bachelor's (B.A., B.S.)",
  "Master's (M.A., M.S.)",
  'Doctoral (Ph.D., J.D., M.D.)',
  'Prefer not to specify',
]

// Initialize form data if not already defined
if (!api.persist.isDefined('parentForm')) {
  api.persist.parentForm = reactive({
    videoConsent: '', // 'lab_only' or 'share_excerpts'
    signature: null, // base64 signature data
    // howFoundUs: {
    //   socialMedia: false,
    //   wordOfMouth: false,
    //   flyer: false,
    //   school: false,
    //   other: false,
    // },
    // howFoundUsOther: '',
    primaryLanguage: '',
    primaryLanguageOther: '',
    education: '',
    issues: '', // was `comments` in the template
  })
}

const signaturePad = ref(null)

const complete = computed(() => {
  return api.persist.parentForm.videoConsent !== '' && api.persist.parentForm.signature !== null
})

function clearSignature() {
  if (signaturePad.value) {
    signaturePad.value.clearSignature()
    api.persist.parentForm.signature = null
  }
}

function saveSignature() {
  if (signaturePad.value) {
    const { isEmpty, data } = signaturePad.value.saveSignature()
    if (!isEmpty) {
      api.persist.parentForm.signature = data
    }
  }
}

// the signature is saved automatically each time the pen is lifted, so there
// is no separate "Save Signature" step
const signatureOptions = { penColor: '#000', onEnd: saveSignature }

function autofill() {
  api.persist.parentForm.videoConsent = 'lab_only'
  api.persist.parentForm.signature = 'data:image/png;base64,AUTOFILL'
  // api.persist.parentForm.howFoundUs.socialMedia = true
  api.persist.parentForm.primaryLanguage = 'English'
  api.persist.parentForm.education = 'Prefer not to specify'
  api.persist.parentForm.issues = 'Test comment'
}

api.setAutofill(autofill)

function finish() {
  saveSignature()
  api.recordPageData(api.persist.parentForm)
  api.saveData(true)
  api.goNextView()
}
</script>

<template>
  <ConstrainedPage
    :responsiveUI="api.config.responsiveUI"
    :width="api.config.windowsizerRequest.width"
    :height="api.config.windowsizerRequest.height"
  >
    <TitleTwoCol leftFirst leftWidth="w-1/3" :responsiveUI="api.config.responsiveUI">
      <template #title>
        <h3 class="text-3xl font-bold mb-4">
          <i-fa6-solid-clipboard-list class="inline mr-2" />&nbsp;Parent/Guardian Form
        </h3>
        <p class="text-lg mb-8">
          Please complete this form before finishing the study. Your responses help us improve our research.
        </p>
      </template>

      <template #left>
        <div class="text-left text-muted-foreground">
          <h3 class="text-lg font-bold mb-2">About This Form</h3>
          <p class="text-md font-light text-muted-foreground">
            This form collects your video privacy settings and a little information about your family.
          </p>
        </div>
      </template>

      <template #right>
        <div class="border border-border text-left bg-muted p-6 rounded-lg">
          <!-- this page is longer than the window: say so before the first question -->
          <p class="text-md font-semibold text-muted-foreground mb-4">* Scroll down for more</p>

          <!-- Video privacy settings -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3">
              Please choose your privacy settings for the video from this session.
              <span class="text-red-500">*</span>
            </label>
            <p class="text-sm text-muted-foreground mb-3">
              By default, videos will only remain accessible by lab researchers, unless you provide your additional
              consent for additional uses.
            </p>
            <div class="space-y-3">
              <label
                v-for="option in PRIVACY_OPTIONS"
                :key="option.value"
                class="flex items-start gap-3 p-3 rounded-md border border-border bg-background cursor-pointer"
              >
                <input
                  type="radio"
                  name="videoConsent"
                  class="mt-1 shrink-0"
                  :id="`videoConsent-${option.value}`"
                  :value="option.value"
                  v-model="api.persist.parentForm.videoConsent"
                />
                <span class="text-base">{{ option.text }}</span>
              </label>
            </div>
          </div>

          <!-- Digital Signature -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3">
              Please provide your signature for the above video privacy settings.
              <span class="text-red-500">*</span>
            </label>
            <div class="border border-border rounded-md bg-background p-1">
              <VueSignaturePad ref="signaturePad" width="100%" height="150px" :options="signatureOptions" />
            </div>
            <div class="flex gap-2 mt-2">
              <Button variant="outline" size="sm" @click="clearSignature"> Clear and sign again </Button>
              <!-- <Button variant="outline" size="sm" @click="saveSignature"> Save Signature </Button> -->
              <!-- (the signature now saves automatically when the pen is lifted) -->
            </div>
            <p v-if="api.persist.parentForm.signature" class="text-xs text-green-600 mt-1">Signature saved</p>
          </div>

          <!-- How Did You Find Us: not used in this study
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-3">
              How did you find out about this study?
              <span class="font-normal text-muted-foreground">(check all that apply)</span>
            </label>
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.socialMedia" id="socialMedia" />
                <Label for="socialMedia">Social media</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.wordOfMouth" id="wordOfMouth" />
                <Label for="wordOfMouth">Word of mouth</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.flyer" id="flyer" />
                <Label for="flyer">Flyer or poster</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.school" id="school" />
                <Label for="school">School or community center</Label>
              </div>
              <div class="flex items-center gap-2">
                <Checkbox v-model:checked="api.persist.parentForm.howFoundUs.other" id="otherCheckbox" />
                <Label for="otherCheckbox">Other</Label>
              </div>
              <Input
                v-if="api.persist.parentForm.howFoundUs.other"
                v-model="api.persist.parentForm.howFoundUsOther"
                placeholder="Please specify"
                class="bg-background dark:bg-background text-base"
              />
            </div>
          </div>
          -->

          <!-- Primary Language -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-2">
              What is the primary language you use to speak to your child at home?
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Select v-model="api.persist.parentForm.primaryLanguage">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="language in LANGUAGE_OPTIONS" :key="language" :value="language">
                  {{ language }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input
              v-if="api.persist.parentForm.primaryLanguage === LANGUAGE_OTHER"
              v-model="api.persist.parentForm.primaryLanguageOther"
              placeholder="Please specify"
              class="mt-2 bg-background dark:bg-background text-base"
            />
          </div>

          <!-- Education -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-2">
              What is the highest level of education you have completed?
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Select v-model="api.persist.parentForm.education">
              <SelectTrigger class="w-full bg-background dark:bg-background text-base">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="level in EDUCATION_OPTIONS" :key="level" :value="level">
                  {{ level }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Feedback -->
          <div class="mb-6">
            <label class="block text-md font-semibold text-foreground mb-2">
              If you experienced any problems or confusion with this task, please let us know here.
              <span class="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              v-model="api.persist.parentForm.issues"
              class="w-full bg-background dark:bg-background text-base resize-vertical"
              rows="4"
            />
          </div>

          <!-- Submit -->
          <hr class="border-border my-6" />
          <div class="flex justify-end">
            <Button variant="default" :disabled="!complete" @click="finish()"> Submit and Continue </Button>
          </div>
        </div>
      </template>
    </TitleTwoCol>
  </ConstrainedPage>
</template>
