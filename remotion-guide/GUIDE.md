# 用 remotion-best-practices 制作视频

这是一个 44 秒、1280×720、30 fps 的中文动画教程（带背景音乐、转场及操作音效，无人声配音）。

## 分镜

| 时间 | 内容 |
| --- | --- |
| 00–04 秒 | 山景画面推入：从想法到视频 |
| 04–08 秒 | 技能安装命令逐字出现 |
| 08–12 秒 | 需求生成山景，主题和风格标签入场 |
| 12–16 秒 | 全景、推近、标题三个分镜依次排开 |
| 16–20 秒 | 山体视差、画面推近与帧数联动 |
| 20–24 秒 | Studio 时间轴、音乐波形与播放头 |
| 41–44 秒 | 导出命令与完成提示（渲染进度为动画示意） |

## 在这个项目里操作

技能安装位置：`../.agents/skills/remotion-best-practices/SKILL.md`。
它已安装，无需重复执行视频中的通用安装命令。

```sh
cd remotion-guide
npm run dev
```

在 Studio 选择 `RemotionGuide`，按空格播放。章节位于同一条轨道，各场景可分别修改。

导出命令（在此子项目目录执行）：

```sh
npx remotion render src/index.ts RemotionGuide out/remotion-guide.mp4
```

## 可复制的需求

> 使用本项目的 remotion-best-practices，为初学者制作一支 44 秒的中文视频，解释如何使用这个 skill 制作视频。16:9，深色背景，大字标题，青绿色重点。先做分镜，再制作帧驱动动画，并在 Remotion Studio 打开预览。

## 本次实现原则

- 用 Composition 声明尺寸、帧率和总帧数。
- 每个章节使用独立 JSX 节点和明确的时长。
- 动画由 useCurrentFrame 与 interpolate 驱动，避免 CSS animation。
- 不依赖远程图片、字体或音频；中文字体使用系统字体。
- 按项目要求仅进行冒烟检查。

来源：https://skills.sh/remotion-dev/skills/remotion-best-practices

## 第二版音画设计

- 自绘 SVG 山景，多层视差运动与推近镜头。
- 120 BPM 合成器配乐；所有音乐和音效在本地生成，无远程音频依赖。
- `scripts/make-audio.py` 可重建 WAV；配乐音量 0.42，转场 0.22，点击 0.25，完成提示 0.35。
- 旧版源码保存在 `archive/Composition-v1.tsx`。
- 第二版时长 1320 帧 / 44 秒。

## 节奏调整

开场、六个操作步骤与四段用途演示统一为每段 4 秒，总长 44 秒。转场、操作音效、推近动画与音乐淡出同步调整。

## 用途演示

新增效果位于 `src/Showcases.tsx`。字幕使用 Caption JSON 数据按音乐节拍高亮，没有人声转录。画幅变化演示构图适配，不代表已生成多个导出文件。所有场景动画由帧驱动。
