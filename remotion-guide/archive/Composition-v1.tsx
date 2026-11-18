import {
  AbsoluteFill,
  Easing,
  Interactive,
  Track,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ReactNode } from "react";

const Reveal = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Interactive.Div
      name="内容入场"
      style={{
        opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 0.8 * fps], ["0px 24px", "0px 0px"], {
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {children}
    </Interactive.Div>
  );
};
const Shell = ({
  step,
  label,
  title,
  children,
}: {
  step: string;
  label: string;
  title: string;
  children: ReactNode;
}) => (
  <AbsoluteFill
    style={{
      backgroundColor: "#10191c",
      color: "#f2f0e9",
      fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
      padding: "62px 80px",
    }}
  >
    <div
      style={{
        position: "absolute",
        right: 55,
        top: 15,
        fontSize: 250,
        fontWeight: 800,
        color: "#18272b",
      }}
    >
      {step}
    </div>
    <div
      style={{
        fontSize: 17,
        letterSpacing: 3,
        color: "#80dfba",
        marginBottom: 25,
      }}
    >
      SKILL GALLERY / REMOTION LAB
    </div>
    <div style={{ fontSize: 20, color: "#a6b6b8", marginBottom: 15 }}>
      {label}
    </div>
    <Reveal>
      <div
        style={{
          fontSize: 64,
          fontWeight: 750,
          letterSpacing: -2,
          lineHeight: 1.2,
          marginBottom: 32,
        }}
      >
        {title}
      </div>
      {children}
    </Reveal>
    <div
      style={{
        position: "absolute",
        bottom: 35,
        left: 80,
        right: 80,
        borderTop: "1px solid #354247",
        paddingTop: 17,
        display: "flex",
        justifyContent: "space-between",
        fontSize: 15,
        color: "#a5b4b5",
      }}
    >
      <span>remotion-best-practices</span>
      <span>从需求到视频 · 一步一步来</span>
    </div>
  </AbsoluteFill>
);
const Terminal = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      background: "#19282d",
      border: "1px solid #3c555b",
      borderRadius: 18,
      padding: "26px 30px",
      fontFamily: "Menlo, monospace",
      fontSize: 25,
      lineHeight: 1.65,
      whiteSpace: "pre-wrap",
      color: "#80dfba",
    }}
  >
    {children}
  </div>
);
const Note = ({ children }: { children: ReactNode }) => (
  <div
    style={{ fontSize: 29, lineHeight: 1.55, color: "#c3ced0", marginTop: 23 }}
  >
    {children}
  </div>
);

const Intro = () => (
  <Shell step="▶" label="75 秒入门 / 中文图文教程" title="让一个想法，动起来。">
    <div style={{ fontSize: 43, color: "#80dfba", marginBottom: 28 }}>
      用 remotion-best-practices 制作视频
    </div>
    <div style={{ display: "flex", gap: 18 }}>
      {["描述需求", "生成代码", "预览视频"].map((s, i) => (
        <div
          key={s}
          style={{
            padding: "22px 28px",
            border: "1px solid #45605f",
            borderRadius: 12,
            fontSize: 29,
          }}
        >
          <span style={{ color: "#80dfba" }}>{i + 1} / </span>
          {s}
        </div>
      ))}
    </div>
    <Note>Skill 提供制作规范 · Remotion 将 React 画面变成视频</Note>
  </Shell>
);
const Install = () => (
  <Shell step="01" label="STEP 01 / 项目级安装" title="先把技能放进项目。">
    <Terminal>
      {"npx skills add remotion-dev/skills\n  --skill remotion-best-practices"}
    </Terminal>
    <Note>上方命令合为一行执行，选择当前项目与 Codex。</Note>
    <div style={{ fontSize: 23, marginTop: 20, color: "#80dfba" }}>
      检查 .agents/skills/remotion-best-practices/SKILL.md
    </div>
  </Shell>
);
const Brief = () => (
  <Shell
    step="02"
    label="STEP 02 / 给 AI 一份清晰的需求"
    title="说清楚，你想拍什么。"
  >
    <div
      style={{
        borderLeft: "5px solid #80dfba",
        paddingLeft: 26,
        fontSize: 34,
        lineHeight: 1.65,
      }}
    >
      “使用 remotion-best-practices，
      <br />
      为初学者做一支 75 秒的中文教程。
      <br />
      16:9，深色背景，大字标题，先给我预览。”
    </div>
    <Note>主题 + 观众 + 时长 + 比例 + 风格 + 交付物</Note>
  </Shell>
);
const Project = () => (
  <Shell step="03" label="STEP 03 / 分镜与项目" title="把内容拆成几个场景。">
    <Terminal>
      {
        "npx create-video@latest --yes --blank my-video\ncd my-video && npm install"
      }
    </Terminal>
    <div style={{ display: "flex", gap: 14, marginTop: 22 }}>
      {["开场 7s", "安装 12s", "需求 12s", "…", "导出 9s"].map((t) => (
        <div
          key={t}
          style={{
            background: "#28403e",
            padding: "16px 20px",
            fontSize: 25,
            borderRadius: 8,
          }}
        >
          {t}
        </div>
      ))}
    </div>
    <Note>Composition：1280 × 720 · 30 fps · 2250 帧 = 75 秒</Note>
  </Shell>
);
const MotionDemo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        background: "#80dfba",
        color: "#10251d",
        borderRadius: 16,
        padding: 28,
        width: 380,
      }}
    >
      <div
        style={{
          fontSize: 37,
          fontWeight: 700,
          opacity: interpolate(frame, [fps, 3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Hello, Remotion
      </div>
      <div
        style={{
          height: 8,
          background: "#58ae8e",
          marginTop: 30,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            height: 8,
            background: "#10251d",
            borderRadius: 8,
            width: interpolate(frame, [fps, 3 * fps], [0, 324], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        />
      </div>
      <div style={{ fontSize: 20, marginTop: 20 }}>0 → 1 / 标题逐帧淡入</div>
    </div>
  );
};
const Animate = () => (
  <Shell step="04" label="STEP 04 / 帧驱动动画" title="每一帧，都可以控制。">
    <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
      <div style={{ flex: 1 }}>
        <Terminal>
          {
            'const frame = useCurrentFrame();\nconst {fps} = useVideoConfig();\n\nopacity: interpolate(\n  frame, [fps, 3 * fps], [0, 1],\n  {extrapolateLeft: "clamp",\n   extrapolateRight: "clamp"}\n)'
          }
        </Terminal>
      </div>
      <MotionDemo />
    </div>
  </Shell>
);
const Preview = () => (
  <Shell step="05" label="STEP 05 / 预览与迭代" title="先播放，再精修。">
    <Terminal>npx remotion studio</Terminal>
    <div style={{ display: "flex", gap: 24, marginTop: 28 }}>
      {["播放看节奏", "拖动看转场", "逐场景改文字"].map((t, i) => (
        <div
          key={t}
          style={{
            flex: 1,
            borderTop: "3px solid #80dfba",
            paddingTop: 18,
            fontSize: 30,
          }}
        >
          <div style={{ fontSize: 17, color: "#80dfba", marginBottom: 10 }}>
            CHECK 0{i + 1}
          </div>
          {t}
        </div>
      ))}
    </div>
    <Note>告诉 AI：“第二幕停留久一点，标题再大一点。”</Note>
  </Shell>
);
const Export = () => (
  <Shell step="06" label="STEP 06 / 导出成片" title="满意之后，导出 MP4。">
    <Terminal>
      {
        "npx remotion render src/index.ts \\\n  RemotionGuide out/remotion-guide.mp4"
      }
    </Terminal>
    <Note>这条命令在本教程的 remotion-guide 目录执行。</Note>
    <div
      style={{ fontSize: 38, fontWeight: 650, color: "#80dfba", marginTop: 28 }}
    >
      安装 → 描述 → 分镜 → 动画 → 预览 → 导出
    </div>
  </Shell>
);

export const Guide = () => {
  const { fps } = useVideoConfig();
  return (
    <>
      <Track name="教程章节">
        <InteractiveScene name="开场" durationInFrames={7 * fps} kind="intro" />
        <InteractiveScene
          name="01 安装技能"
          from={7 * fps}
          durationInFrames={12 * fps}
          kind="install"
        />
        <InteractiveScene
          name="02 描述需求"
          from={19 * fps}
          durationInFrames={12 * fps}
          kind="brief"
        />
        <InteractiveScene
          name="03 创建项目"
          from={31 * fps}
          durationInFrames={12 * fps}
          kind="project"
        />
        <InteractiveScene
          name="04 帧驱动动画"
          from={43 * fps}
          durationInFrames={12 * fps}
          kind="animate"
        />
        <InteractiveScene
          name="05 预览修改"
          from={55 * fps}
          durationInFrames={11 * fps}
          kind="preview"
        />
        <InteractiveScene
          name="06 导出"
          from={66 * fps}
          durationInFrames={9 * fps}
          kind="export"
        />
      </Track>
      <Progress />
    </>
  );
};
const Scene = ({ kind }: { kind: string }) => {
  switch (kind) {
    case "install":
      return <Install />;
    case "brief":
      return <Brief />;
    case "project":
      return <Project />;
    case "animate":
      return <Animate />;
    case "preview":
      return <Preview />;
    case "export":
      return <Export />;
    default:
      return <Intro />;
  }
};
export const InteractiveScene = Interactive.create({
  Component: Scene,
  layout: "absolute-fill",
  schema: {
    kind: { type: "string", default: "intro", description: "章节类型" },
  },
});
const Progress = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 5,
        background: "#80dfba",
        width: interpolate(frame, [0, durationInFrames - 1], [0, 1280]),
      }}
    />
  );
};
