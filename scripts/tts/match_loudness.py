"""Match the loudness of the study's audio clips to the training videos, and
give the 5 scale clips the same length.

The training videos (public/stimuli/generic/*.mp4, specific/*.mp4) come from
the adult study and are the reference: their loudness is measured and nothing
in them is changed. Every other clip is then turned up or down to it:
  - all spoken clips in public/stimuli/audio/ (task intro, test trials, scale,
    child assent, ...): same loudness as the training videos
  - the sound check bird clip (misc/sound_check.m4a): BIRD_RATIO (2/3) of the
    training videos' amplitude, i.e. about 3.5 dB quieter, so a parent who
    sets the volume by the bird does not end up with the study too quiet

Loudness here is the RMS level of the sounding parts of a clip (50 ms frames
above -50 dBFS; silence is not counted), in dBFS. The reference is the median
over the training videos. Turning speech up this far would clip its peaks, so
a limiter holds them under CEILING_DB.

The 5 scale clips (audio/scale_*.m4a, "Only one Zarpie." ...) are first made
equally long: the silence before the speech is cut (and any breath in it),
then every clip gets SCALE_LEAD_S of silence before the speech and enough
after it to be as long as the longest one. Each choice is then enlarged on screen for the same time and
the voice starts the same moment after it enlarges.

Run it after generate_stimuli.py whenever clips are (re)generated:
    python scripts/tts/match_loudness.py            # measure, then adjust
    python scripts/tts/match_loudness.py --dry-run  # measure only

Clips already within TOLERANCE_DB of their target are left alone, so running
it again does not re-encode anything. Requires numpy and macOS afconvert.
"""

import argparse
import glob
import os
import subprocess
import tempfile
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
STIMULI = os.path.join(os.path.dirname(os.path.dirname(HERE)), "public", "stimuli")

BIRD = "misc/sound_check.m4a"
BIRD_RATIO = 2 / 3  # bird amplitude / training video amplitude
CEILING_DB = -1.0  # peaks are held under this
TOLERANCE_DB = 0.3
FRAME_S = 0.05
GATE_DB = -50.0
SCALE_LEAD_S = 0.15  # silence before the speech in every scale clip
SCALE_TAIL_S = 0.10  # silence after the speech in the longest scale clip
SPEECH_DB = -30.0  # below this (relative to the clip's peak) counts as silence


def db(x):
    return 20 * np.log10(max(x, 1e-9))


def read_audio(path):
    """Decode any audio or video file to float samples (frames x channels)."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16", path, wav], check=True, capture_output=True)
    with wave.open(wav) as w:
        rate, channels = w.getframerate(), w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    os.remove(wav)
    return x.reshape(-1, channels), rate


def write_m4a(x, rate, path):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        wav = tmp.name
    with wave.open(wav, "wb") as w:
        w.setnchannels(x.shape[1])
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", wav, path], check=True, capture_output=True)
    os.remove(wav)


def loudness(x, rate):
    """RMS level (dBFS) of the sounding 50 ms frames."""
    n = int(rate * FRAME_S)
    frames = x[: len(x) // n * n].reshape(-1, n * x.shape[1])
    rms = np.sqrt((frames**2).mean(axis=1))
    active = rms[rms > 10 ** (GATE_DB / 20)]
    return db(np.sqrt((active**2).mean())) if len(active) else -np.inf


def limit(x, rate):
    """Turn down just the peaks above the ceiling (5 ms look-ahead limiter)."""
    ceiling = 10 ** (CEILING_DB / 20)
    peak = np.abs(x).max(axis=1)
    if peak.max() <= ceiling:
        return x
    k = int(rate * 0.005)
    padded = np.pad(peak, k, mode="edge")
    window = np.lib.stride_tricks.sliding_window_view(padded, 2 * k + 1)
    gain = np.minimum(1, ceiling / np.maximum(window.max(axis=1), 1e-9))
    # smooth the gain so it does not click; a shorter window than the peak
    # search, so the smoothed gain still covers every peak
    half = k // 2
    gain = np.convolve(np.pad(gain, half, mode="edge"), np.ones(2 * half + 1) / (2 * half + 1), mode="valid")
    return x * gain[:, None]


def match(x, rate, target):
    """Scale x to the target loudness, limiting the peaks."""
    gain_db = target - loudness(x, rate)
    y = x
    for _ in range(8):  # the limiter takes a little loudness back: make it up
        y = limit(x * 10 ** (gain_db / 20), rate)
        error = target - loudness(y, rate)
        if abs(error) < 0.05:
            break
        gain_db += error
    return y


def speech_span(x, rate):
    """(start, end) of the speech in a clip, in samples."""
    n = int(rate * 0.01)
    frames = np.abs(x[: len(x) // n * n]).max(axis=1).reshape(-1, n).max(axis=1)
    sounding = np.where(frames > np.abs(x).max() * 10 ** (SPEECH_DB / 20))[0]
    # a little extra on both sides, to keep a soft first sound and a quiet final "s"
    start = max(0, sounding[0] * n - int(rate * 0.03))
    end = min(len(x), (sounding[-1] + 1) * n + int(rate * 0.15))
    return start, end


def even_scale_clips(dry_run):
    """Pad the scale clips to one length, with the same silence before the speech."""
    paths = sorted(glob.glob(os.path.join(STIMULI, "audio", "scale_*.m4a")))
    clips = []
    for path in paths:
        x, rate = read_audio(path)
        start, end = speech_span(x, rate)
        clips.append(dict(path=path, x=x, rate=rate, start=start, end=end))
    # already evened (same length, same silence before the speech): leave them
    lengths = [len(c["x"]) / c["rate"] for c in clips]
    leads = [c["start"] / c["rate"] for c in clips]
    evened = max(lengths) - min(lengths) < 0.06 and all(abs(lead - SCALE_LEAD_S) < 0.06 for lead in leads)
    longest = max((c["end"] - c["start"]) / c["rate"] for c in clips)
    total = float(np.mean(lengths)) if evened else SCALE_LEAD_S + longest + SCALE_TAIL_S
    print(f"scale clips (each {total:.2f} s: {SCALE_LEAD_S} s silence, speech, silence to the end)")
    for c in clips:
        rate, name = c["rate"], os.path.relpath(c["path"], STIMULI)
        length, lead, speech = len(c["x"]) / rate, c["start"] / rate, (c["end"] - c["start"]) / rate
        note = "ok" if evened else ("to do" if dry_run else "evened")
        print(f"  {name:38s} {length:.2f} s, speech {speech:.2f} s after {lead:.2f} s  {note}")
        if evened or dry_run:
            continue
        silence = lambda seconds: np.zeros((int(round(seconds * rate)), c["x"].shape[1]))
        padded = np.concatenate([silence(SCALE_LEAD_S), c["x"][c["start"] : c["end"]], silence(total - SCALE_LEAD_S - speech)])
        write_m4a(padded, rate, c["path"])
    print()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="measure only, change nothing")
    args = ap.parse_args()

    even_scale_clips(args.dry_run)

    videos = sorted(glob.glob(os.path.join(STIMULI, "generic", "*.mp4")) + glob.glob(os.path.join(STIMULI, "specific", "*.mp4")))
    levels = []
    print("training videos (reference)")
    for path in videos:
        level = loudness(*read_audio(path))
        levels.append(level)
        print(f"  {os.path.relpath(path, STIMULI):38s} {level:6.1f} dB")
    reference = float(np.median(levels))
    print(f"  median {reference:.1f} dB (range {min(levels):.1f} to {max(levels):.1f})\n")

    clips = [(p, reference) for p in sorted(glob.glob(os.path.join(STIMULI, "audio", "*.m4a")))]
    clips.append((os.path.join(STIMULI, BIRD), reference + db(BIRD_RATIO)))

    print("clips")
    for path, target in clips:
        x, rate = read_audio(path)
        before = loudness(x, rate)
        name = os.path.relpath(path, STIMULI)
        if abs(before - target) <= TOLERANCE_DB:
            print(f"  {name:38s} {before:6.1f} dB  ok")
        elif args.dry_run:
            print(f"  {name:38s} {before:6.1f} dB  -> target {target:.1f}")
        else:
            write_m4a(match(x, rate, target), rate, path)
            after = loudness(*read_audio(path))
            print(f"  {name:38s} {before:6.1f} dB  -> {after:6.1f} dB")


if __name__ == "__main__":
    main()
