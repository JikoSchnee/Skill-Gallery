import {
  KineticTitle,
  TransitionDemo,
  CaptionDemo,
  FormatDemo,
} from "./Showcases";
import {
  AbsoluteFill,
  Interactive,
  Track,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import type { ReactNode } from "react";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const font = '"PingFang SC", "Microsoft YaHei", sans-serif';

// One illustrated source becomes the storyboard, edited shot, and final movie.
export const Landscape = ({ mini = false }: { mini?: boolean }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        background: "#facb99",
      }}
    >
      <svg
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="sky" x2="0" y2="1">
            <stop stopColor="#f6b18a" />
            <stop offset="1" stopColor="#ffe9b6" />
          </linearGradient>
        </defs>
        <rect width="800" height="500" fill="url(#sky)" />
        <circle
          cx={570 + Math.sin(f / 80) * 10}
          cy="140"
          r="62"
          fill="#fff2c5"
        />
        <g
          transform={`translate(${Math.sin(f / 110) * 18} 0)`}
          fill="#fff5de"
          opacity=".7"
        >
          <ellipse cx="160" cy="110" rx="100" ry="12" />
          <ellipse cx="640" cy="75" rx="75" ry="8" />
        </g>
        <path
          d={`M-40 410 L${180 + Math.sin(f / 100) * 10} 140 L390 390 L580 205 L850 440 V500 H-40Z`}
          fill="#9c859a"
        />
        <path
          d="M-50 460 L180 285 L350 440 L550 270 L850 450 V500 H-50Z"
          fill="#526c80"
        />
        <g transform={`translate(${Math.sin(f / 70) * 22} 0)`}>
          <path
            d="M-50 460 Q160 330 370 440 T850 400 V550 H-50Z"
            fill="#284d54"
          />
          <path
            d="M-30 510 Q210 420 450 480 T850 430 V550 H-30Z"
            fill="#173a3e"
          />
        </g>
        <path
          d="M520 500 Q360 450 420 412 Q475 380 450 360"
          fill="none"
          stroke="#e7b97c"
          strokeWidth="16"
        />
        <g fill="#173a3e" transform={`translate(${Math.sin(f / 50) * 8} 0)`}>
          <path d="M80 450V310L45 385H65L38 423H80M80 310L115 385H95L123 423H80" />
          <path d="M700 450V290L655 385H679L645 430H700M700 290L745 385H721L755 430H700" />
        </g>
      </svg>
      {!mini && (
        <div
          style={{
            position: "absolute",
            left: 35,
            bottom: 30,
            color: "#fff6df",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 5,
          }}
        >
          MAKE IT MOVE.
        </div>
      )}
    </div>
  );
};
const Picture = ({ style = {} }: { style?: React.CSSProperties }) => (
  <div
    style={{
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 28px 70px #0005",
      ...style,
    }}
  >
    <Landscape />
  </div>
);
const Caption = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: "absolute",
      bottom: 36,
      left: 65,
      right: 65,
      textAlign: "center",
      fontSize: 27,
      color: "#e9ede8",
    }}
  >
    {children}
  </div>
);
const Label = ({ n, children }: { n: string; children: ReactNode }) => (
  <div
    style={{
      position: "absolute",
      top: 38,
      left: 60,
      color: "#9ce4c1",
      fontSize: 18,
      letterSpacing: 2,
    }}
  >
    REMOTION LAB <span style={{ margin: "0 18px", color: "#54696a" }}>/</span>
    {n} · {children}
  </div>
);
const Heading = ({ children }: { children: ReactNode }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        fontSize: 65,
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: -2,
        translate: `0px ${interpolate(f, [0, 15], [24, 0], clamp)}px`,
        opacity: interpolate(f, [0, 10], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
};
const Intro = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Picture
        style={{
          position: "absolute",
          left: 535,
          top: 100,
          width: 650,
          height: 450,
          rotate: `${interpolate(f, [0, 100], [8, -3], clamp)}deg`,
          scale: interpolate(f, [0, 100], [0.8, 1.08], clamp),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 170,
          width: 600,
          textShadow: "0 4px 35px #132626",
        }}
      >
        <div style={{ fontSize: 22, color: "#9ce4c1", marginBottom: 20 }}>
          remotion-best-practices
        </div>
        <Heading>
          从一个想法，
          <br />
          到一支视频。
        </Heading>
        <div style={{ fontSize: 31, marginTop: 25, color: "#9ce4c1" }}>
          44 秒 · 看它如何发生
        </div>
      </div>
      <Caption>用 Skill 指导制作，用 Remotion 让画面动起来。</Caption>
    </>
  );
};
const Install = () => {
  const f = useCurrentFrame();
  const lines = [
    "$ npx skills add remotion-dev/skills",
    "  --skill remotion-best-practices",
    "✓ 选择当前项目 · Codex",
    "✓ .agents/skills/…/SKILL.md",
  ];
  return (
    <>
      <Label n="01">安装技能</Label>
      <div style={{ position: "absolute", left: 65, top: 115 }}>
        <Heading>给 AI 一本制作手册。</Heading>
      </div>
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 240,
          width: 775,
          padding: 28,
          background: "#203536",
          borderRadius: 18,
          border: "1px solid #49615e",
          fontFamily: "Menlo, monospace",
          fontSize: 25,
          lineHeight: 1.8,
        }}
      >
        {lines.map((s, i) => (
          <div
            key={s}
            style={{
              color: i < 2 ? "#f5e8d2" : "#9ce4c1",
              opacity: interpolate(f, [i * 18, i * 18 + 8], [0, 1], clamp),
            }}
          >
            {s.slice(0, Math.max(0, Math.floor((f - i * 18) * 2)))}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          left: 910,
          top: 235,
          width: 230,
          height: 280,
          borderRadius: 16,
          background: "#9ce4c1",
          color: "#173e37",
          padding: 30,
          rotate: `${Math.sin(f / 25) * 4}deg`,
          scale: interpolate(f, [30, 48], [0.5, 1], clamp),
        }}
      >
        <div style={{ fontSize: 70 }}>✳</div>
        <div style={{ fontSize: 29, fontWeight: 800, marginTop: 15 }}>
          SKILL.md
        </div>
        <div style={{ fontSize: 21, marginTop: 14 }}>
          分镜 / 动画
          <br />
          音频 / 导出
        </div>
      </div>
      <Caption>命令合为一行执行；在当前项目安装后，检查技能文件。</Caption>
    </>
  );
};
const Brief = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Label n="02">描述需求</Label>
      <div style={{ position: "absolute", left: 65, top: 130, width: 560 }}>
        <Heading>
          把想法，
          <br />
          说具体。
        </Heading>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.7,
            marginTop: 25,
            color: "#cad6cc",
          }}
        >
          “使用这个 Skill，制作一支
          <br />
          山野旅行短片，16:9，
          <br />
          暖色画面，带音乐和动画。”
        </div>
      </div>
      <Picture
        style={{
          position: "absolute",
          left: 680,
          top: 150,
          width: 500,
          height: 350,
          scale: interpolate(f, [25, 100], [0.8, 1], clamp),
          rotate: `${interpolate(f, [25, 100], [7, -2], clamp)}deg`,
        }}
      />
      {["主题：旅行", "风格：暖色", "声音：轻快"].map((s, i) => (
        <div
          key={s}
          style={{
            position: "absolute",
            left: 710 + i * 35,
            top: 450 + i * 42,
            background: ["#ffca91", "#9ce4c1", "#e0d7fc"][i],
            color: "#173c34",
            padding: "12px 22px",
            fontSize: 23,
            fontWeight: 700,
            rotate: `${i * 3 - 3}deg`,
            opacity: interpolate(f, [35 + i * 20, 45 + i * 20], [0, 1], clamp),
          }}
        >
          {s}
        </div>
      ))}
      <Caption>给出主题、时长、比例和风格，AI 才能设计对应的镜头。</Caption>
    </>
  );
};
const Story = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Label n="03">创建项目与分镜</Label>
      <div style={{ position: "absolute", left: 65, top: 105 }}>
        <Heading>先拆镜头，再排时间。</Heading>
      </div>
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 205,
          fontSize: 22,
          fontFamily: "Menlo, monospace",
          color: "#9ce4c1",
        }}
      >
        npx create-video@latest --yes --blank my-video
      </div>
      {["01 / 全景", "02 / 推近", "03 / 标题"].map((s, i) => (
        <div
          key={s}
          style={{
            position: "absolute",
            left: 65 + i * 390,
            top: 285,
            width: 355,
            translate: `0px ${interpolate(f, [i * 20, i * 20 + 20], [100, 0], clamp)}px`,
            opacity: interpolate(f, [i * 20, i * 20 + 15], [0, 1], clamp),
            rotate: `${interpolate(f, [i * 20, i * 20 + 25], [i % 2 ? 8 : -8, 0], clamp)}deg`,
          }}
        >
          <div
            style={{
              position: "relative",
              height: 220,
              borderRadius: 14,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                scale: i === 1 ? 1.4 : 1,
              }}
            >
              <Landscape mini />
            </div>
            {i === 2 && (
              <div
                style={{
                  position: "absolute",
                  left: 24,
                  bottom: 28,
                  color: "#fff6df",
                  fontSize: 34,
                  fontWeight: 800,
                }}
              >
                去山野，出发。
              </div>
            )}
          </div>
          <div style={{ marginTop: 15, fontSize: 25, color: "#9ce4c1" }}>
            {s}
          </div>
        </div>
      ))}
      <Caption>Composition 定义尺寸与帧率，独立场景按时间顺序编排。</Caption>
    </>
  );
};
const Animate = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Label n="04">帧驱动动画</Label>
      <div style={{ position: "absolute", left: 65, top: 110 }}>
        <Heading>把静止的图，变成镜头。</Heading>
      </div>
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 240,
          width: 690,
          height: 340,
          overflow: "hidden",
          borderRadius: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            scale: interpolate(f, [0, 105], [1, 1.22], clamp),
            translate: `${interpolate(f, [0, 105], [0, -20], clamp)}px 0px`,
          }}
        >
          <Landscape />
        </div>
        <div
          style={{
            position: "absolute",
            left: 24,
            top: 24,
            border: "1px solid #fff9",
            padding: "7px 12px",
            fontSize: 18,
          }}
        >
          ● REC · FRAME {String(f).padStart(3, "0")}
        </div>
      </div>
      <div style={{ position: "absolute", left: 800, top: 250, width: 410 }}>
        <div style={{ fontSize: 29, color: "#9ce4c1", marginBottom: 25 }}>
          画面推近 + 山体视差
        </div>
        <pre style={{ fontSize: 21, lineHeight: 1.7, color: "#e5d2b7" }}>
          {
            "const frame =\n  useCurrentFrame();\n\nscale: interpolate(\n  frame, [0, 105],\n  [1, 1.22]\n)"
          }
        </pre>
        <div
          style={{
            height: 7,
            width: 350,
            background: "#34514b",
            marginTop: 20,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#9ce4c1",
              width: interpolate(f, [0, 105], [0, 350], clamp),
            }}
          />
        </div>
      </div>
      <Caption>动画跟着帧走：推近、位移和文字入场，都能精确控制。</Caption>
    </>
  );
};
const Edit = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Label n="05">预览 · 配乐 · 精修</Label>
      <div style={{ position: "absolute", left: 65, top: 105 }}>
        <Heading>画面踩点，声音跟上。</Heading>
      </div>
      <div
        style={{
          position: "absolute",
          left: 65,
          top: 210,
          color: "#9ce4c1",
          fontSize: 22,
          fontFamily: "Menlo, monospace",
        }}
      >
        npx remotion studio
      </div>
      <Picture
        style={{
          position: "absolute",
          left: 65,
          top: 270,
          width: 460,
          height: 290,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 575,
          top: 270,
          width: 625,
          height: 290,
          background: "#203535",
          borderRadius: 16,
          padding: 25,
        }}
      >
        <div style={{ fontSize: 18, color: "#b4c7be", marginBottom: 20 }}>
          STUDIO / TIMELINE
        </div>
        <div style={{ display: "flex", gap: 8, height: 75 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{ flex: 1, borderRadius: 6, overflow: "hidden" }}
            >
              <Landscape mini />
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 65,
            gap: 4,
            marginTop: 15,
            background: "#325c50",
            padding: 10,
            borderRadius: 6,
          }}
        >
          {Array.from({ length: 56 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 10 + Math.abs(Math.sin(i * 1.8)) * 30,
                background: "#9ce4c1",
              }}
            />
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            top: 65,
            bottom: 30,
            width: 3,
            left: 25 + ((f % 105) / 105) * 570,
            background: "#ffbd83",
          }}
        />
        <div style={{ marginTop: 12, fontSize: 17, color: "#ffbd83" }}>
          ♫ 120 BPM / 点击 / 转场 / 完成提示
        </div>
      </div>
      <Caption>在 Studio 播放检查节奏，让音乐、音效与画面动作对齐。</Caption>
    </>
  );
};
const Export = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Label n="06">导出成片</Label>
      <div style={{ position: "absolute", left: 65, top: 120, width: 580 }}>
        <Heading>{f < 70 ? "最后，生成视频。" : "从想法，到成片。"}</Heading>
        <div
          style={{
            fontSize: 24,
            fontFamily: "Menlo, monospace",
            lineHeight: 1.8,
            color: "#9ce4c1",
            marginTop: 32,
            whiteSpace: "pre-wrap",
          }}
        >
          {"npx remotion render src/index.ts\n  RemotionGuide out/guide.mp4"}
        </div>
        <div
          style={{
            height: 9,
            width: 480,
            background: "#36544c",
            marginTop: 34,
            borderRadius: 9,
          }}
        >
          <div
            style={{
              height: 9,
              background: "#9ce4c1",
              width: interpolate(f, [0, 70], [0, 480], clamp),
              borderRadius: 9,
            }}
          />
        </div>
        <div style={{ marginTop: 18, fontSize: 24 }}>
          {f < 70
            ? `渲染示意 ${Math.floor(interpolate(f, [0, 70], [0, 100], clamp))}%`
            : "✓ MP4 · 可以分享了"}
        </div>
      </div>
      <Picture
        style={{
          position: "absolute",
          left: 710,
          top: 170,
          width: 460,
          height: 350,
          rotate: `${interpolate(f, [0, 90], [6, -3], clamp)}deg`,
        }}
      />
      <Caption>满意后明确要求导出 MP4。上方命令在本教程目录执行。</Caption>
    </>
  );
};
const Scene = ({ kind }: { kind: string }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "#102d2b",
        color: "#f4f1e7",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 850,
          height: 850,
          border: "1px solid #42635644",
          borderRadius: "50%",
          right: -260,
          top: -280,
          scale: 1 + Math.sin(f / 50) * 0.03,
        }}
      />
      {kind === "intro" ? (
        <Intro />
      ) : kind === "install" ? (
        <Install />
      ) : kind === "brief" ? (
        <Brief />
      ) : kind === "story" ? (
        <Story />
      ) : kind === "animate" ? (
        <Animate />
      ) : kind === "edit" ? (
        <Edit />
      ) : kind === "titles" ? (
        <KineticTitle />
      ) : kind === "transitions" ? (
        <TransitionDemo />
      ) : kind === "captions" ? (
        <CaptionDemo />
      ) : kind === "formats" ? (
        <FormatDemo />
      ) : (
        <Export />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#9ce4c1",
          translate: `${interpolate(f, [0, 12], [0, 1300], clamp)}px 0px`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
const Chapter = Interactive.create({
  Component: Scene,
  layout: "absolute-fill",
  schema: { kind: { type: "string", default: "intro", description: "场景" } },
});
const Soundtrack = () => {
  const f = useCurrentFrame();
  return (
    <Audio
      name="原创轻电子配乐 120 BPM"
      durationInFrames={1320}
      src={staticFile("audio/pulse-120bpm.wav")}
      volume={interpolate(f, [0, 30, 1260, 1319], [0, 0.42, 0.42, 0], clamp)}
    />
  );
};
export const Guide = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Track name="镜头">
        <Chapter
          name="开场：想法变视频"
          kind="intro"
          durationInFrames={4 * fps}
        />
        <Chapter
          name="01 安装"
          kind="install"
          from={4 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="02 需求与图像"
          kind="brief"
          from={8 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="03 分镜"
          kind="story"
          from={12 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="04 视差与推近"
          kind="animate"
          from={16 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="05 声画编辑"
          kind="edit"
          from={20 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="用途：动态标题"
          kind="titles"
          from={24 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="用途：镜头转场"
          kind="transitions"
          from={28 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="用途：音乐与字幕"
          kind="captions"
          from={32 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="用途：多平台画幅"
          kind="formats"
          from={36 * fps}
          durationInFrames={4 * fps}
        />
        <Chapter
          name="06 导出"
          kind="export"
          from={40 * fps}
          durationInFrames={4 * fps}
        />
      </Track>
      <Soundtrack />
      <Track name="转场音效">
        <Audio
          name="开场扫过"
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="安装扫过"
          from={4 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="需求扫过"
          from={8 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="分镜扫过"
          from={12 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="动画扫过"
          from={16 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="编辑扫过"
          from={20 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="导出扫过"
          from={40 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
      </Track>
      <Track name="用途演示音效">
        <Audio
          name="标题入场"
          from={24 * fps}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="镜头擦除"
          from={28 * fps + 35}
          src={staticFile("audio/whoosh.wav")}
          volume={0.3}
        />
        <Audio
          name="字幕开始"
          from={32 * fps + 15}
          src={staticFile("audio/click.wav")}
          volume={0.25}
        />
        <Audio
          name="竖屏变化"
          from={36 * fps + 30}
          src={staticFile("audio/whoosh.wav")}
          volume={0.22}
        />
        <Audio
          name="方屏变化"
          from={36 * fps + 80}
          src={staticFile("audio/click.wav")}
          volume={0.25}
        />
      </Track>
      <Track name="操作提示">
        <Audio
          name="安装点击"
          from={5 * fps}
          src={staticFile("audio/click.wav")}
          volume={0.25}
        />
        <Audio
          name="标签点击"
          from={10 * fps}
          src={staticFile("audio/click.wav")}
          volume={0.25}
        />
        <Audio
          name="镜头点击"
          from={13 * fps}
          src={staticFile("audio/click.wav")}
          volume={0.25}
        />
        <Audio
          name="导出完成"
          from={40 * fps + 70}
          src={staticFile("audio/done.wav")}
          volume={0.35}
        />
      </Track>
      <Sequence name="全片进度" layout="none">
        <Progress />
      </Sequence>
    </>
  );
};
const Progress = () => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        height: 4,
        width: (f / 1319) * 1280,
        background: "#9ce4c1",
      }}
    />
  );
};
