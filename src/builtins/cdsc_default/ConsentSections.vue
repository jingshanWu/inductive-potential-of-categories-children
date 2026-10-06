<script setup>
// The six information slides of the lab's consent (PANDA consent and assent
// slides, version of 2024-12-17), as text with the slides' pictures:
//   1 About the Study, 2 Contact Info, 3 What Will My Child Do?,
//   4 Participation, 5 Use of Data, 6 Risks & Benefits
// `section` picks one of them; with `pictures` false only the text is shown
// (for the "View consent" window). SECTION_TITLES gives the slides' titles.
//
// The few parts that differ from study to study come from
// src/user/components/consentStudyInfo.js.
import study from '@/user/components/consentStudyInfo'
import piPhoto from '@/assets/cdsc_default/consent/pi_photo.jpg'
import nyuLogo from '@/assets/cdsc_default/consent/nyu_logo.png'
import kidsReading from '@/assets/cdsc_default/consent/kids_reading.png'
import parentChildLaptop from '@/assets/cdsc_default/consent/parent_child_laptop.jpg'
import keyboardHands from '@/assets/cdsc_default/consent/keyboard_hands.png'
import handsSky from '@/assets/cdsc_default/consent/hands_sky.jpg'
import handsSilhouette from '@/assets/cdsc_default/consent/hands_silhouette.jpg'
import lock from '@/assets/cdsc_default/consent/lock.png'
import privateSign from '@/assets/cdsc_default/consent/private.png'
import kidsGroup from '@/assets/cdsc_default/consent/kids_group.jpg'
import brain from '@/assets/cdsc_default/consent/brain.jpg'

defineProps({
  section: { type: Number, required: true }, // 1-6
  pictures: { type: Boolean, default: true },
})
</script>

<script>
export const SECTION_TITLES = [
  'About the Study',
  'Contact Info',
  'What Will My Child Do?',
  'Participation',
  'Use of Data',
  'Risks & Benefits',
]
</script>

<template>
  <div class="flex gap-8 items-center text-2xl leading-snug">
    <!-- 1. About the Study -->
    <template v-if="section === 1">
      <ul class="flex-1 list-disc pl-7 space-y-5">
        <li>This study is conducted by New York University researcher Marjorie Rhodes.</li>
        <li>
          This study seeks to find out:
          <div class="mt-2 bg-[#fff6e3] border border-[#f3e3c0] px-4 py-2 text-center font-semibold text-[#b03030]">
            {{ study.seeksToFindOut }}
          </div>
        </li>
        <li v-if="study.resultsMayHelpIdentify">
          The results of this study may help us identify {{ study.resultsMayHelpIdentify }}
        </li>
        <li>
          This study does <u>not</u> evaluate abilities of individual children. We are looking to understand how kids
          learn <u>in general</u>.
        </li>
      </ul>
      <div v-if="pictures" class="w-[270px] shrink-0 flex flex-col items-center gap-2">
        <img :src="piPhoto" alt="Marjorie Rhodes" draggable="false" class="h-[140px]" />
        <img :src="nyuLogo" alt="NYU" draggable="false" class="h-[56px]" />
        <img :src="kidsReading" alt="" draggable="false" class="w-full mt-3" />
      </div>
    </template>

    <!-- 2. Contact Info -->
    <template v-else-if="section === 2">
      <div class="flex-1">
        <div class="flex items-center justify-between gap-6 mb-6 px-7">
          <p class="font-semibold text-xl leading-relaxed">
            Marjorie Rhodes<br />
            Principal Investigator and Professor<br />
            <a href="http://www.psych.nyu.edu/rhodes" target="_blank" rel="noopener" class="underline"
              >http://www.psych.nyu.edu/rhodes</a
            ><br />
            IRB-FY2024-9169
          </p>
          <img v-if="pictures" :src="piPhoto" alt="Marjorie Rhodes" draggable="false" class="h-[150px]" />
        </div>
        <ul class="list-disc pl-7 space-y-5 text-xl">
          <li>
            If you have any questions, you may contact Dr. Marjorie Rhodes by phone,
            <span class="text-[#2a5db0]">212-998-3546</span>, by email,
            <a href="mailto:marjorie.rhodes@nyu.edu" class="text-[#2a5db0]">marjorie.rhodes@nyu.edu</a>, or by mail, at
            New York University Psychology Department, 6 Washington Place, room 329, New York, NY 10003.
          </li>
          <li>
            For questions about your child’s rights as a research participant, please contact the Human Research
            Protection Program, New York University. Phone: <span class="text-[#2a5db0]">212-998-4808</span>, Email:
            <a href="mailto:ask.humansubjects@nyu.edu" class="text-[#2a5db0]">ask.humansubjects@nyu.edu</a>.
          </li>
        </ul>
      </div>
    </template>

    <!-- 3. What Will My Child Do? -->
    <template v-else-if="section === 3">
      <ul class="flex-1 list-disc pl-7 space-y-6">
        <li>Your child will <b>watch an interactive video</b> or <b>make choices during an online activity.</b></li>
        <li>Your child will proceed at his/her own pace the whole time.</li>
        <li>
          Sessions last no longer than <b>{{ study.maxMinutes }} minutes</b>.
        </li>
        <li>Parents must remain present for the duration of the session.</li>
      </ul>
      <div v-if="pictures" class="w-[300px] shrink-0 flex flex-col items-center gap-4">
        <img :src="parentChildLaptop" alt="" draggable="false" class="w-full" />
        <img :src="keyboardHands" alt="" draggable="false" class="w-[210px]" />
      </div>
    </template>

    <!-- 4. Participation -->
    <template v-else-if="section === 4">
      <ul class="flex-1 list-disc pl-7 space-y-8">
        <li>
          Your and your child’s participation are <b><u>entirely voluntary</u></b
          >.
        </li>
        <li>You may choose to stop the study session at any point without penalty.</li>
        <li>Please pause or stop the study if your child becomes fussy.</li>
      </ul>
      <div v-if="pictures" class="w-[320px] shrink-0">
        <img :src="handsSky" alt="" draggable="false" class="w-full" />
        <img :src="handsSilhouette" alt="" draggable="false" class="w-full" />
      </div>
    </template>

    <!-- 5. Use of Data -->
    <template v-else-if="section === 5">
      <ul class="flex-1 list-disc pl-7 space-y-6">
        <li>Recordings from this study will be stored on a <b>password-protected</b> server.</li>
        <li>At the end of your session, you will <b>select a privacy level.</b></li>
        <li>
          <u>Unless otherwise specified</u> in your privacy settings:
          <ul class="list-disc pl-7 mt-2 space-y-1 text-lg">
            <li>
              Information not containing identifiers may be used in future research, shared with other researchers, or
              placed in a data repository without your additional consent
            </li>
            <li>Video clips will not be shared</li>
            <li>Personal information will not be published</li>
          </ul>
        </li>
      </ul>
      <div v-if="pictures" class="w-[230px] shrink-0 flex flex-col items-center gap-5">
        <img :src="lock" alt="" draggable="false" class="w-[170px]" />
        <img :src="privateSign" alt="Private" draggable="false" class="w-full" />
      </div>
    </template>

    <!-- 6. Risks & Benefits -->
    <template v-else>
      <ul class="flex-1 list-disc pl-7 space-y-5">
        <li>
          This study includes a <b>minimal risk</b> of a potential breach in confidentiality.
          <ul class="list-disc pl-7 mt-2 space-y-1 text-lg">
            <li>
              Video of your child’s participation will be stored our lab’s servers, accessible only to trained
              researchers in the lab with server login credentials for data analysis. There is a minimal risk of the
              server being breached.
            </li>
            <li>Care has been taken to ensure that visual or motor fatigue are avoided.</li>
          </ul>
        </li>
        <li>Children usually very much enjoy these studies, but there are no direct benefits.</li>
        <li>
          These studies will (hopefully!) <span class="text-[#e8442a]">advance our understanding</span> of how children
          learn.
        </li>
      </ul>
      <div v-if="pictures" class="w-[250px] shrink-0 flex flex-col items-center gap-4">
        <img :src="kidsGroup" alt="" draggable="false" class="w-full" />
        <img :src="brain" alt="" draggable="false" class="w-[170px]" />
      </div>
    </template>
  </div>
</template>
