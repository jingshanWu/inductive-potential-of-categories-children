"""Generate the study's spoken audio with Google Cloud TTS.

Reads every spoken text from src/user/components/zarpies/stimuli.js (single
source of truth) and writes one m4a per clip to the path stimuli.js gives it
under public/stimuli/ (audio/<id>.m4a):
  - 16 induction trials (a description clip and a question clip each) and
    the attention check
  - 5 scale options ("Only one Zarpie." ...), plus the first / last variants
    for the reversed scale ("All Zarpies.", "Or only one Zarpie.")
  - the scale training (intro, one clip per card, 5 practice items with their
    right / wrong feedback) and the 2 end-check questions
  - the induction intro message
  - the task intro, adult and child wording

Voice: Chirp3-HD-Callirrhoe, the voice used in the GRB recognition study. To
regenerate with a different voice:
    python generate_stimuli.py --voice en-US-Chirp3-HD-Leda --force

Skips files that already exist unless --force (so after changing a sentence
in stimuli.js, delete its m4a or use --force). Writes a summary CSV next to
this script. Freshly generated clips are much quieter than the training
videos: run match_loudness.py (this folder) afterwards to bring them to the
same loudness. Requires gcloud application-default credentials, node, the
google-cloud-texttospeech package, and macOS afconvert. Adapted from
scripts/tts/generate_stimuli.py in the GRB recognition study repo.
"""

import argparse
import csv
import datetime
import json
import os
import subprocess
import tempfile
import wave

from google.cloud import texttospeech

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
STIMULI_JS = os.path.join(REPO, "src", "user", "components", "zarpies", "stimuli.js")
AUDIO_ROOT = os.path.join(REPO, "public", "stimuli")

# load stimuli.js in node and print [{file, text}] for every spoken clip
DUMP_CLIPS_JS = """
import fs from 'fs'
const src = fs.readFileSync(process.argv[1], 'utf8').replace(/import\\.meta\\.env\\.BASE_URL/g, '"/"')
const m = await import('data:text/javascript,' + encodeURIComponent(src))
const clips = [
  ...m.inductionTrials().flatMap((t) => [
    ...(t.audio.description ? [{ file: t.audio.description, text: t.premise }] : []),
    { file: t.audio.question, text: t.attentionCheck ? t.text : t.question },
  ]),
  ...m.SCALE_OPTIONS.map((o) => ({ file: o.audio, text: o.spoken, rate: o.speakingRate })),
  ...m.SCALE_OPTIONS.flatMap((o) => [o.first, o.last].filter(Boolean).map((c) => ({ file: c.audio, text: c.spoken, rate: o.speakingRate }))),
  { file: m.INDUCTION_INTRO.audio, text: m.INDUCTION_INTRO.text, rate: 0.85 }, // a little slower, for children
  { file: m.TASK_INTRO.adult.audio, text: m.TASK_INTRO.adult.text },
  { file: m.TASK_INTRO.child.audio, text: m.TASK_INTRO.child.text },
  // scale training and end check (Rhodes & Liebenson, 2015 warm-up), at their own speaking rate
  ...[
    { file: m.SCALE_TRAINING.intro.audio, text: m.SCALE_TRAINING.intro.text },
    ...Object.values(m.SCALE_TRAINING.cards).map((c) => ({ file: c.audio, text: c.text })),
    ...Object.values(m.SCALE_TRAINING.options).map((c) => ({ file: c.audio, text: c.text })),
    { file: m.SCALE_TRAINING.practiceIntro.audio, text: m.SCALE_TRAINING.practiceIntro.text },
    ...m.SCALE_TRAINING.items.flatMap((it) =>
      [it.question, it.right, it.wrongRest, ...Object.values(it.youThink)].map((c) => ({ file: c.audio, text: c.text }))
    ),
    { file: m.SCALE_TRAINING.wrongGood.audio, text: m.SCALE_TRAINING.wrongGood.text },
    { file: m.SCALE_TRAINING.end.audio, text: m.SCALE_TRAINING.end.text },
  ].map((c) => ({ ...c, rate: m.SCALE_TRAINING.speakingRate })),
  ...[
    { file: m.SCALE_BRIDGE.intro.audio, text: m.SCALE_BRIDGE.intro.text },
  ].map((c) => ({ ...c, rate: m.SCALE_BRIDGE.speakingRate })),
  ...[
    { file: m.END_CHECK.intro.audio, text: m.END_CHECK.intro.text },
    ...m.END_CHECK.items.map((it) => ({ file: it.question.audio, text: it.question.text })),
  ].map((c) => ({ ...c, rate: m.END_CHECK.speakingRate })),
]
console.log(JSON.stringify(clips))
"""


def read_clips():
    """Get (file, text) for every spoken clip listed in stimuli.js."""
    out = subprocess.run(
        ["node", "--input-type=module", "-e", DUMP_CLIPS_JS, STIMULI_JS],
        check=True,
        capture_output=True,
        text=True,
    )
    clips = json.loads(out.stdout)
    assert len({c["file"] for c in clips}) == len(clips), "duplicate audio paths in stimuli.js"
    return clips


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="en-US-Chirp3-HD-Callirrhoe")
    ap.add_argument("--force", action="store_true", help="regenerate even if file exists")
    args = ap.parse_args()

    client = texttospeech.TextToSpeechClient()
    clips = read_clips()
    rows = []

    for clip in clips:
        out = os.path.join(AUDIO_ROOT, clip["file"])
        os.makedirs(os.path.dirname(out), exist_ok=True)
        if os.path.exists(out) and not args.force:
            print("skip:", clip["file"], flush=True)
            continue
        resp = client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=clip["text"]),
            voice=texttospeech.VoiceSelectionParams(language_code="en-US", name=args.voice),
            audio_config=texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.LINEAR16,
                speaking_rate=clip.get("rate"),  # None = the voice's normal rate
            ),
            timeout=30,
        )
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp.write(resp.audio_content)
            tmp_path = tmp.name
        with wave.open(tmp_path) as w:
            dur = w.getnframes() / w.getframerate()
        subprocess.run(
            ["afconvert", "-f", "m4af", "-d", "aac", tmp_path, out],
            check=True,
            capture_output=True,
        )
        os.remove(tmp_path)
        rows.append(dict(file=clip["file"], text=clip["text"], dur=round(dur, 2)))
        print(f"wrote: {clip['file']} ({dur:.2f}s)", flush=True)

    if rows:
        stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M")
        summary = os.path.join(HERE, f"generation_summary_{args.voice}_{stamp}.csv")
        with open(summary, "w", newline="") as f:
            wr = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
            wr.writeheader()
            wr.writerows(rows)
        print(f"\n{len(rows)} files generated; summary: {summary}")
    else:
        print("\nnothing to do (all files exist; use --force to regenerate)")


if __name__ == "__main__":
    main()
