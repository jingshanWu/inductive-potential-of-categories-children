/**
 * Fast forward, for developing and testing a study.
 *
 * Switched on with one line in design.js:
 *
 *     api.setRuntimeConfig('fastForward', true)
 *
 * While it is on, every clip and video (AutoplayAudio, AutoplayVideo) counts
 * as played the moment it starts, so every button that waits for a narration
 * is clickable at once, pages that move on by themselves move on at once,
 * the test's timed pauses are skipped, and the signature box and the data
 * upload bar do not hold things up. Delete the line and the study is back to
 * normal.
 *
 * It only works in development mode: on the live site the line is ignored
 * (and a warning is logged), so a forgotten line cannot change what a
 * participant sees.
 */

import useAPI from '@/core/composables/useAPI'

export function isFastForward() {
  const api = useAPI()
  const wanted = !!api.store.config.runtime?.fastForward
  if (wanted && api.config.mode !== 'development') {
    api.log.warn('fastForward is set but only works in development mode; ignored')
    return false
  }
  return wanted
}
