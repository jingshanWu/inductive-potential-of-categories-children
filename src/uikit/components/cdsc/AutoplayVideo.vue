<script setup>
/**
 * AutoplayVideo Component
 *
 * WHAT IT IS
 * - A video that plays by itself, for children who should just watch.
 * - No controls: it cannot be paused, skipped, or rewatched.
 * - If the video does not play, it shows a button instead of a frozen screen:
 *   - Play: the browser refused to start a video with sound because nobody
 *     has clicked on the page yet (e.g. after a reload). One click starts it.
 *   - Replay: the video file could not be loaded. The click tries again from
 *     the beginning, with a line asking the parent to email the lab if it keeps
 *     happening.
 * - Neither button skips the video. The only way forward is watching it to
 *   the end.
 *
 * HOW IT IS USED
 * - Put it inside an element that has a width and a height; the video is
 *   scaled to fit that box.
 *
 *     <div class="w-full h-[90vh]">
 *       <AutoplayVideo :src="videoUrl" @ended="goOn" />
 *     </div>
 *
 * - src: the video's URL. It starts playing as soon as the component appears.
 * - @ended: fires when the video has played to the end. Move on from there.
 * - To play several videos in a row, keep the component on the page and just
 *   change src: the new video starts by itself. (Reusing the same player is
 *   what lets the browser keep autoplaying with sound.)
 * - With fast forward on (fastForward.js, development only) the video is not
 *   played: @ended fires at once.
 */

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '@/uikit/components/ui/button'
import { isFastForward } from './fastForward'

const props = defineProps({
  src: { type: String, required: true },
})

const emit = defineEmits(['ended'])

const video = ref(null)
const fastForward = isFastForward() // development only: videos count as played at once
const blocked = ref(false) // browser refused to autoplay
const failed = ref(false) // video file could not be loaded
const failure = ref('') // what went wrong, shown on the Replay screen for support

// how long after asking the video to play it is checked that it really is
const STALL_CHECK_MS = 2500

let loads = 0 // counts start() calls, to tell a play() that a newer load replaced
let stallTimer = null

function play() {
  blocked.value = false
  const load = loads
  // Safari does not always say that it refused to autoplay: play() can end
  // with an AbortError, or the video is simply left paused, and the page
  // stayed blank. So whatever play() reports, if the video is still paused a
  // moment later, show the Play button.
  clearTimeout(stallTimer)
  stallTimer = setTimeout(() => {
    if (load !== loads || failed.value || !video.value) return
    if (video.value.paused && !video.value.ended) blocked.value = true
  }, STALL_CHECK_MS)
  video.value.play().catch((err) => {
    // this play() was interrupted by a new load() (the src changed again):
    // the newer call takes over
    if (load !== loads) return
    // NotAllowedError: the browser wants a click first -> Play button. So
    // does an AbortError that no newer load explains. Anything else (e.g.
    // NotSupportedError) means the file cannot be played -> Replay screen.
    if (err.name === 'NotAllowedError' || err.name === 'AbortError') blocked.value = true
    else fail(`${err.name}: ${err.message}`)
  })
}

onBeforeUnmount(() => clearTimeout(stallTimer))

function fail(reason) {
  failure.value = `${reason} (${props.src.split('/').slice(-2).join('/')})`
  failed.value = true
}

// the <video> reported an error
function onError() {
  const err = video.value?.error
  // Safari reports a load that was cut short by a new load() or src change
  // as an error with code MEDIA_ERR_ABORTED (Chrome only fires `abort`).
  // Nothing is wrong with the video, so it is not a failure.
  if (!err || err.code === MediaError.MEDIA_ERR_ABORTED) return
  fail(`media error ${err.code}: ${err.message || 'no message'}`)
}

// load the current src and play it from the beginning
function start() {
  // the <video> element does not exist yet (the component is not mounted) or
  // is gone (unmounted); onMounted() starts the video once it exists
  if (!video.value) return
  failed.value = false
  loads += 1
  if (fastForward) {
    setTimeout(() => emit('ended'), 0) // as if the video had just finished
    return
  }
  video.value.src = props.src
  video.value.load()
  play()
}

onMounted(start)
// flush: 'post' runs the watcher after the DOM has been updated, so the
// <video> ref is set even when src changes during the parent's first render
// (the training view re-renders a few times while its steps are being set
// up; with the default pre-render flush the ref was still null and start()
// threw, which in dev mode aborted the view's update and the navigation).
// If the element already has this src (onMounted just loaded it), do not
// load it a second time: the interrupted first load made Safari report an
// error and stop.
watch(
  () => props.src,
  (src) => {
    if (video.value && video.value.getAttribute('src') === src) return
    start()
  },
  { flush: 'post' }
)
</script>

<template>
  <div class="relative flex items-center justify-center w-full h-full">
    <video
      ref="video"
      class="max-w-full max-h-full"
      preload="auto"
      playsinline
      disablepictureinpicture
      @contextmenu.prevent
      @ended="emit('ended')"
      @error="onError()"
    ></video>

    <!-- autoplay was blocked: one click starts the video -->
    <div v-if="blocked && !failed" class="absolute inset-0 flex items-center justify-center">
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="autoplayvideo-play" @click="play()">
        <i-fa6-solid-play class="mr-2" /> Play
      </Button>
    </div>

    <!-- video could not be loaded: try again (there is no way to skip it) -->
    <div v-if="failed" class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <p class="text-lg mb-6">Sorry, the video could not be played.</p>
      <Button variant="default" size="lg" class="text-2xl px-12 py-8" id="autoplayvideo-replay" @click="start()">
        <i-fa6-solid-rotate-right class="mr-2" /> Replay
      </Button>
      <p class="text-lg mt-6">
        If this keeps happening, please exit the session and email discoveriesinaction@gmail.com for assistance.
      </p>
      <p class="text-sm mt-4 text-muted-foreground">{{ failure }}</p>
    </div>
  </div>
</template>
