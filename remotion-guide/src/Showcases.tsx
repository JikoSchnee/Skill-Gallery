import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Caption } from "@remotion/captions";
import { Landscape } from "./Composition";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Badge = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "absolute",
      top: 40,
      left: 60,
      fontSize: 22,
      color: "#9ce4c1",
      letterSpacing: 2,
      zIndex: 10,
    }}
  >
    SKILL 能做什么 / {children}
  </div>
);
const Foot = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: "absolute",
      bottom: 35,
      width: "100%",
      textAlign: "center",
      fontSize: 26,
      zIndex: 10,
      color: "#f4f1e7",
      textShadow: "0 2px 10px #102d2b",
    }}
  >
    {children}
  </div>
);
export const KineticTitle = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Badge>动态标题 / 品牌片头</Badge>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            border: "2px solid #9ce4c1",
            borderRadius: "50%",
            scale: interpolate(f, [10, 100], [0.3, 1.8], clamp),
            opacity: 0.25,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            border: "2px dashed #ffca91",
            rotate: `${f * 0.6}deg`,
            borderRadius: "50%",
            scale: interpolate(f, [10, 100], [0.5, 1.4], clamp),
            opacity: 0.25,
          }}
        />
        <div style={{ display: "flex", gap: 12, perspective: 800 }}>
          {["让", "创", "意", "起", "飞"].map((c, i) => (
            <div
              key={c}
              style={{
                fontSize: 130,
                fontWeight: 900,
                color: i > 2 ? "#ffca91" : "#f4f1e7",
                translate: `0px ${interpolate(f, [10 + i * 6, 27 + i * 6, 35 + i * 6], [220, -20, 0], clamp)}px`,
                rotate: `${interpolate(f, [10 + i * 6, 35 + i * 6], [30, 0], clamp)}deg`,
                opacity: interpolate(
                  f,
                  [10 + i * 6, 20 + i * 6],
                  [0, 1],
                  clamp,
                ),
                scale: interpolate(
                  f,
                  [70 + i * 3, 80 + i * 3, 90 + i * 3],
                  [1, 1.15, 1],
                  clamp,
                ),
              }}
            >
              {c}
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 455,
            height: 9,
            width: interpolate(f, [45, 70], [0, 800], clamp),
            background: "#9ce4c1",
            rotate: "-2deg",
          }}
        />
      </div>
      <Foot>逐字弹入 → 弹性回落 → 节拍强调</Foot>
    </>
  );
};
const City = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", inset: 0, background: "#19213e" }}>
      <svg viewBox="0 0 1280 720" style={{ width: "100%", height: "100%" }}>
        <circle cx="950" cy="175" r="75" fill="#f6dcac" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${i * 120 - 80 + f * 0.3} 0)`}>
            <rect
              x="0"
              y={280 + (i % 3) * 65}
              width="105"
              height="450"
              fill={i % 2 ? "#394662" : "#273953"}
            />
            {Array.from({ length: 18 }, (_, j) => (
              <rect
                key={j}
                x={15 + (j % 3) * 27}
                y={300 + (i % 3) * 65 + Math.floor(j / 3) * 40}
                width="12"
                height="19"
                fill={(i + j) % 3 ? "#ffcc8c" : "#587480"}
              />
            ))}
          </g>
        ))}
        <path d="M0 650H1280" stroke="#95e5cd" strokeWidth="4" />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 85,
          bottom: 140,
          fontSize: 72,
          fontWeight: 800,
        }}
      >
        夜色，也有节奏。
      </div>
    </div>
  );
};
export const TransitionDemo = () => {
  const f = useCurrentFrame();
  const wipe = interpolate(f, [35, 65], [100, 0], clamp);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, scale: 1.05 }}>
        <Landscape mini />
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 140,
          fontSize: 72,
          fontWeight: 800,
          color: "#fff4dc",
        }}
      >
        从山野，去城市。
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${wipe}% 0 0)`,
        }}
      >
        <City />
      </div>
      <div
        style={{
          position: "absolute",
          left: `${100 - wipe}%`,
          top: 0,
          bottom: 0,
          width: 8,
          background: "#9ce4c1",
          opacity: f > 34 && f < 66 ? 1 : 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#102d2b",
          opacity: 0.18,
        }}
      />
      <Badge>镜头转场 / 场景切换</Badge>
      <Foot>两个独立场景 · 擦除转场 · 音效落在切换点</Foot>
    </>
  );
};
const BeatCaptions = ({ captions }: { captions: Caption[] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (f / fps) * 1000;
  return (
    <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
      {captions.map((c) => (
        <span
          key={c.startMs}
          style={{
            fontSize: 52,
            fontWeight: 800,
            padding: "10px 17px",
            borderRadius: 12,
            background:
              ms >= c.startMs && ms < c.endMs ? "#9ce4c1" : "#102d2bcc",
            color: ms >= c.startMs && ms < c.endMs ? "#102d2b" : "#fff",
            scale: ms >= c.startMs && ms < c.endMs ? 1.08 : 1,
          }}
        >
          {c.text}
        </span>
      ))}
    </div>
  );
};
export const CaptionDemo = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: 0.7, scale: 1.1 }}>
        <Landscape mini />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(transparent,#102d2b)",
        }}
      />
      <Badge>音乐 / 音效 / 动态字幕</Badge>
      <div
        style={{
          position: "absolute",
          top: 180,
          left: 100,
          right: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          height: 200,
        }}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 14,
              borderRadius: 8,
              background: i % 3 === 0 ? "#ffca91" : "#9ce4c1",
              height:
                (25 + Math.abs(Math.sin(i * 0.7)) * 140) *
                (1 - 0.65 * ((f % 15) / 15)),
              opacity: 0.9,
            }}
          />
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 430 }}>
        <BeatCaptions
          captions={[
            {
              text: "让",
              startMs: 500,
              endMs: 1000,
              timestampMs: 750,
              confidence: null,
            },
            {
              text: "画面",
              startMs: 1000,
              endMs: 1500,
              timestampMs: 1250,
              confidence: null,
            },
            {
              text: "跟着",
              startMs: 1500,
              endMs: 2000,
              timestampMs: 1750,
              confidence: null,
            },
            {
              text: "节拍",
              startMs: 2000,
              endMs: 2500,
              timestampMs: 2250,
              confidence: null,
            },
            {
              text: "动起来",
              startMs: 2500,
              endMs: 4000,
              timestampMs: 3250,
              confidence: null,
            },
          ]}
        />
      </div>
      <Foot>120 BPM 节拍驱动图形 + 逐词高亮（字幕节奏示意）</Foot>
    </>
  );
};
export const FormatDemo = () => {
  const f = useCurrentFrame();
  const w = interpolate(f, [15, 40, 65, 90], [690, 300, 300, 430], clamp);
  const h = interpolate(f, [15, 40, 65, 90], [388, 470, 470, 430], clamp);
  return (
    <>
      <Badge>视频规格 / 多平台画幅</Badge>
      <div
        style={{
          position: "absolute",
          left: 640 - w / 2,
          top: 115,
          width: w,
          height: h,
          overflow: "hidden",
          borderRadius: 20,
          border: "4px solid #9ce4c1",
          boxShadow: "0 25px 60px #0005",
        }}
      >
        <Landscape mini />
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: 20,
            right: 20,
            textAlign: "center",
            fontSize: 38,
            fontWeight: 800,
            color: "#fff1d6",
          }}
        >
          去山野，出发。
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 265,
          left: 70,
          fontSize: 26,
          color: "#9ce4c1",
        }}
      >
        同一套素材
        <br />
        <span style={{ fontSize: 18, lineHeight: 2, color: "#b7c8be" }}>
          不同画幅与构图
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 75,
          top: 265,
          fontSize: 56,
          fontWeight: 800,
          color: "#ffca91",
        }}
      >
        {f < 30 ? "16:9" : f < 80 ? "9:16" : "1:1"}
      </div>
      <Foot>横屏介绍 → 竖屏短视频 → 方形社媒视频</Foot>
    </>
  );
};
