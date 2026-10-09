"""Find when each word starts in the scale training's "Only one, a few, some,
most, or all." clips, and write the times into stimuli.js (SCALE_TRAINING
.options[...].cues), so the cards can enlarge as their word is read.

The words are separated by the short pauses the voice makes at the commas:
the clip is split at its 4 longest dips in level. Run after regenerating
those clips:
    python scripts/tts/scale_cues.py
"""

import os
import re
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from match_loudness import REPO, STIMULI, read_audio  # noqa: E402

STIMULI_JS = os.path.join(REPO, "src", "user", "components", "zarpies", "stimuli.js")
N_WORDS = 5


def word_starts(path):
    x, rate = read_audio(path)
    x = x[:, 0]
    n = int(rate * 0.01)
    level = np.sqrt((x[: len(x) // n * n].reshape(-1, n) ** 2).mean(axis=1))
    peak = level.max()
    sounding = np.where(level > peak * 10 ** (-30 / 20))[0]
    first, last = sounding[0], sounding[-1]
    # the dips: stretches below -25 dB (relative to the peak) inside the speech
    quiet = level < peak * 10 ** (-25 / 20)
    dips, start = [], None
    for i in range(first, last + 1):
        if quiet[i] and start is None:
            start = i
        if (not quiet[i] or i == last) and start is not None:
            dips.append((i - start, start, i))
            start = None
    dips = sorted(dips, reverse=True)[: N_WORDS - 1]  # the 4 longest pauses
    starts = [first] + sorted(end for _, _, end in dips)
    return [round(s * 0.01, 2) for s in starts]


def main():
    src = open(STIMULI_JS).read()
    for key in ("oneToAll", "allToOne"):
        # the entry may be on one line or several (prettier)
        m = re.search(rf"{key}: \{{\s*text: '([^']*)',\s*audio: '([^']+)',\s*cues: \[[^\]]*\],?\s*\}}", src)
        assert m, key
        cues = word_starts(os.path.join(STIMULI, m.group(2)))
        print(f"{key}: {m.group(1)!r} -> {cues}")
        entry = re.sub(r"cues: \[[^\]]*\]", f"cues: {cues}", m.group(0))
        src = src.replace(m.group(0), entry)
    open(STIMULI_JS, "w").write(src)


if __name__ == "__main__":
    main()
