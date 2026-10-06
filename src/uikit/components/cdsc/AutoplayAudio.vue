<script setup>
/**
 * AutoplayAudio Component
 *
 * WHAT IT IS
 * - A sound clip that plays by itself, for children who should just listen.
 * - It shows nothing on screen while the sound plays normally.
 * - If the sound does not play, it covers the page with a button instead of
 *   leaving the child waiting in silence:
 *   - Play: the browser refused to start the sound because nobody has clicked
 *     on the page yet (e.g. after a reload). One click starts it.
 *   - Replay: the audio file could not be loaded. The click tries again from
 *     the beginning, with a line asking the parent to email the lab if it keeps
 *     happening.
 * - Neither button skips the clip. The only way forward is hearing it to the
 *   end.
 * - The audio counterpart of AutoplayVideo.vue.
 *
 * HOW IT IS USED
 * - Put it anywhere on the page.
 *
 *     <AutoplayAudio :src="clipUrl" @ended="goOn" />
 *
 * - src: the clip's URL. It starts playing as soon as the component appears.
 * - @ended: fires when the clip has played to the end. Move on from there.
 * - @time (optional): fires a few times a second while the clip plays, with
 *   how many seconds of it have played, e.g. to show things on the page as
 *   the voice gets to them.
 * - To play several clips in a row, keep the component on the page and just
 *   change src when @ended fires: the new clip starts by itself. (Reusing the
 *   same player is what lets the browser keep autoplaying.)
 * - Set src to null for silence (e.g. after the last clip).
 * - With fast forward on (fastForward.js, development only) a "Skip audio"
 *   button is shown while a clip plays; it cuts the clip short and fires
 *   @ended, so pages can be clicked through without waiting.
 */

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import { isFastForward } from './fastForward'

const props = defineProps({
  src: { type: String, default: null },
})

const emit = defineEmits(['ended', 'time'])

const audio = ref(null)
const fastForward = isFastForward() // development only: a Skip button on every clip
const playing = ref(false) // a clip is on (for the Skip button)
const blocked = ref(false) // browser refused to autoplay
const failed = ref(false) // audio file could not be loaded

// how long after asking the clip to play it is checked that it really is
const STALL_CHECK_MS = 2500

let loads = 0 // counts start() calls, to tell a play() that a newer load replaced
let stallTimer = null

function play() {
  blocked.value = false
  const load = loads
  // a browser does not always say that it refused to autoplay (see
  // AutoplayVideo.vue): if the clip is still paused a moment later, show the
  // Play button rather than leave the child waiting in silence
  clearTimeout(stallTimer)
  stallTimer = setTimeout(() => {
    if (load !== loads || failed.value || !audio.value || !props.src) return
    if (audio.value.paused && !audio.value.ended) blocked.value = true
  }, STALL_CHECK_MS)
  audio.value.play().catch((err) => {
    if (load !== loads) return // a newer clip took over
    if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) blocked.value = true
  })
}

onBeforeUnmount(() => clearTimeout(stallTimer))

// load the current src and play it from the beginning (or go silent if none)
function start() {
  blocked.value = false
  failed.value = false
  loads += 1
  clearTimeout(stallTimer)
  if (!props.src) {
    audio.value.pause()
    playing.value = false
    return
  }
  audio.value.src = props.src
  audio.value.load()
  playing.value = true
  play()
}

function onEnded() {
  playing.value = false
  emit('ended')
}

// fast forward (development only): the Skip button cuts the clip short, as
// if it had just finished
function skip() {
  loads += 1
  clearTimeout(stallTimer)
  audio.value.pause()
  blocked.value = false
  onEnded()
}

onMounted(start)
watch(() => props.src, start)
</script>

<template>
  <div>
    <audio
      ref="audio"
      preload="auto"
      @ended="onEnded()"
      @timeupdate="emit('time', audio.currentTime)"
      @error="failed = !!src"
    ></audio>

    <!-- fast forward (development): cut the clip short. Sits at the bottom right
         of the page frame (ChildStage), not of the browser window -->
    <button
      v-if="fastForward && playing"
      type="button"
      class="absolute bottom-3 right-3 z-[60] rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-black shadow cursor-pointer"
      id="autoplayaudio-skip"
      @click="skip()"
    >
      Skip audio ▶▶
    </button>

    <!-- autoplay was blocked: one click starts the clip -->
    <div v-if="blocked && !failed" class="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="autoplayaudio-play" @click="play()">
        <i-fa6-solid-play class="mr-2" /> Play
      </Button>
    </div>

    <!-- audio could not be loaded: try again (there is no way to skip it) -->
    <div
      v-if="failed"
      class="fixed inset-0 z-50 flex flex-col items-center justify-center text-center bg-background/80"
    >
      <p class="text-lg mb-6">Sorry, the sound could not be played.</p>
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="autoplayaudio-replay" @click="start()">
        <i-fa6-solid-rotate-right class="mr-2" /> Replay
      </Button>
      <p class="text-lg mt-6">
        If this keeps happening, please exit the session and email discoveriesinaction@gmail.com for assistance.
      </p>
    </div>
  </div>
</template>
