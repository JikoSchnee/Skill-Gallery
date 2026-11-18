"""Render model timestamps on the exact decoded waveform used for analysis."""
import os
os.environ.setdefault("MPLBACKEND", "Agg")
os.environ.setdefault("MPLCONFIGDIR", "/private/tmp/love-like-you-matplotlib")
import json
from pathlib import Path
import numpy as np
import soundfile as sf
import matplotlib.pyplot as plt

OUT = Path(__file__).resolve().parent


def render():
    d = json.loads((OUT / "love-like-you.json").read_text())
    y, sr = sf.read("/private/tmp/love-like-you.wav", always_2d=True)
    duration = len(y) / sr
    window = 441
    mono = y.mean(axis=1)
    usable = len(mono) // window * window
    rms = np.sqrt(np.mean(mono[:usable].reshape(-1, window)**2, axis=1))
    t = (np.arange(len(rms)) + 0.5) * window / sr
    fig, axs = plt.subplots(3, 1, figsize=(15, 5.3), sharex=True,
                            gridspec_kw={"height_ratios": [2.2, 0.9, 1], "hspace": 0.22})
    fig.suptitle(f"Love Like You  |  {duration:.1f}s  |  {d['bpm']} BPM  |  All-In-One", fontsize=16)
    axs[0].fill_between(t, rms, color="#346b84", alpha=0.8)
    axs[0].set_ylabel("RMS energy")
    axs[0].set_ylim(0, rms.max()*1.1)
    axs[1].vlines(d["beats"], 0, 0.45, colors="#9aa8b1", lw=1, label=f"Beats ({len(d['beats'])})")
    axs[1].vlines(d["downbeats"], 0, 0.95, colors="#dc6e2c", lw=1.8,
                  label=f"Bar starts ({len(d['downbeats'])})")
    axs[1].set_ylim(0, 1.15)
    axs[1].set_yticks([])
    axs[1].set_ylabel("Rhythm")
    axs[1].legend(loc="upper left", ncols=2, fontsize=9, frameon=False, bbox_to_anchor=(0, 1.45))
    colors = ["#248f90", "#3da9a7", "#545a64"]
    for s, color in zip(d["segments"], colors):
        axs[2].axvspan(s["start"], s["end"], color=color)
        axs[2].text((s["start"]+s["end"])/2, 0.5,
                    f"{s['label']}\n{s['start']:g}–{s['end']:g}s",
                    ha="center", va="center", color="white", fontsize=10, weight="bold")
        for ax in axs[:2]:
            ax.axvline(s["start"], color="#6a7d89", lw=0.8, ls="--", alpha=0.5)
    axs[2].set_yticks([])
    axs[2].set_ylabel("Segments")
    axs[2].set_xlabel("Time (seconds)")
    axs[2].set_xticks(list(range(0, 51, 2)) + [52.5])
    for ax in axs:
        ax.set_xlim(0, duration)
        ax.spines[["top", "right"]].set_visible(False)
    fig.text(0.125, 0.005, "Model predictions for this clip; segment labels and bar alignment need listening review.",
             fontsize=9, color="#596570")
    for ext in ("png", "pdf"):
        fig.savefig(OUT / f"love-like-you-analysis.{ext}", dpi=160, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    render()
