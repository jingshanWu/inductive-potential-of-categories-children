/**
 * Fast forward, for developing and testing a study.
 *
 * Switched on with one line in design.js:
 *
 *     api.setRuntimeConfig('fastForward', true)
 *
 * While it is on, the clips and videos play as usual, but a "Skip" button
 * (bottom right) is shown while one plays: it cuts the clip short as if it
 * had finished, so every page can be heard to the end or clicked through at
 * once. The test's timed pauses are skipped, and the signature box and the
 * data upload bar do not hold things up. Delete the line and the study is
 * back to normal.
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
