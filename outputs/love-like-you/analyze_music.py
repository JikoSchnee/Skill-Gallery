"""Analyze the supplied clip with the unchanged All-In-One Harmonix ensemble."""
import csv
import json
import os
from pathlib import Path

os.environ.setdefault("MPLBACKEND", "Agg")
os.environ.setdefault("MPLCONFIGDIR", "/private/tmp/love-like-you-matplotlib")
os.environ.setdefault("TORCH_HOME", "/private/tmp/love-like-you-models")
os.environ.setdefault("NUMBA_CACHE_DIR", "/private/tmp/love-like-you-numba")

import torch
import allin1_infer
import matplotlib.pyplot as plt
import soundfile as sf
from allin1_infer.stems import DemucsProvider
from demucs_infer.pretrained import get_model

OUT = Path(__file__).resolve().parent
SOURCE = Path("/Users/jikoschnee/Github Local/remotion pro/public/audio/love-like-you.mp3")
WAV = Path("/private/tmp/love-like-you.wav")


def main():
    torch.set_num_threads(4)
    print("Analyzing with harmonix-all on CPU", flush=True)
    # Use the verified local checkpoint, keeping all caches in the task's temp area.
    checkpoint_dir = Path(os.environ["TORCH_HOME"]) / "hub/checkpoints"
    (checkpoint_dir / "htdemucs.yaml").write_text("models: ['955717e8']\n")
    provider = DemucsProvider(device="cpu")
    provider._model = get_model("htdemucs", repo=checkpoint_dir).to("cpu").eval()
    result = allin1_infer.analyze(
        str(WAV), out_dir=OUT, model="harmonix-all", device="cpu",
        demix_dir="/private/tmp/love-like-you-demix",
        spec_dir="/private/tmp/love-like-you-spec",
        multiprocess=False, keep_byproducts=True, stem_provider=provider,
    )
    fig = allin1_infer.visualize(result, multiprocess=False)
    fig.set_size_inches(16, 4)
    fig.suptitle(f"Love Like You | All-In-One | {result.bpm} BPM")
    fig.savefig(OUT / "love-like-you-analysis.png", dpi=180, bbox_inches="tight")
    fig.savefig(OUT / "love-like-you-analysis.pdf", bbox_inches="tight")
    plt.close(fig)
    audio, sr = allin1_infer.sonify(result, multiprocess=False)
    sf.write(OUT / "love-like-you-marked.wav", audio.T, int(sr), subtype="PCM_16")
    json_path = OUT / "love-like-you.json"
    data = json.loads(json_path.read_text())
    data["path"] = str(SOURCE)
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    with (OUT / "beats.csv").open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["time_seconds", "beat_in_bar", "is_downbeat"])
        for t, position in zip(result.beats, result.beat_positions):
            writer.writerow([f"{t:.3f}", position, int(any(abs(t-d) < 0.03 for d in result.downbeats))])
    with (OUT / "segments.csv").open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["start_seconds", "end_seconds", "label"])
        for s in result.segments:
            writer.writerow([f"{s.start:.3f}", f"{s.end:.3f}", s.label])
    from render_annotation import render
    render()
    print(json.dumps(data, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
