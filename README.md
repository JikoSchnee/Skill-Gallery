# Skill Gallery

本地运行的简约全息 Skill 收藏室，基于 React、TypeScript、Vite、Three.js。无账户、后台和数据库。

## 启动

```sh
npm install
npm run dev
```

访问终端显示的本地地址。`npm run build` 生成 `dist/`，`npm run preview` 预览构建。未部署。

## 新增收藏

编辑 `src/data/entries.ts`，复制一条记录并填写新的唯一 `id`、编号、Skill 来源、标题、简介、模型、日期、标签、过程与心得。每次尝试是独立记录，即使 Skill 相同。日期格式为 `YYYY-MM-DD`，按日期倒序排列。未知模型和心得使用 `null`；不要填入虚构信息。

将网页资源放入 `public/cards/<记录目录>/`，更新 `artwork`、`config` 和 `results`。图片成果设为 `kind: 'image'`，可下载资源设为 `kind: 'link'`。网页内不提供录入表单。

## 卡片源文件

- `cards/holo-forge/`：本次卡片的分层 PNG、配置、可编辑 `card.blend`、渲染和校验记录。
- `public/cards/holo-forge/`：供页面使用的卡片资源与可下载工程。
- `vendor/holo-card-studio/`：来自 EverettFish/holo-card-studio 的原始 MIT 源码，保留许可证。
- `src/components/holoShaders.ts`：由上游全息着色器改编；交互、加载和释放生命周期由 React 组件管理。

重新生成卡片需要 Python 3 + Pillow 和 Blender。运行：

```sh
python3 vendor/holo-card-studio/scripts/run_pipeline.py --project cards/holo-forge --mode holographic --skip-npm
cards/holo-forge/tools/Blender.app/Contents/MacOS/Blender --background --python scripts/render-front.py -- cards/holo-forge
node scripts/sync-card.mjs
```

Blender 便携版安装在 `cards/holo-forge/tools/`（忽略提交），首次获取会校验官方 SHA-256。若上游下载器遇到网络限制，可用 `--blender /绝对路径/Blender` 指定已安装版本。

## 交互与降级

列表整张卡片使用统一的全息覆膜，鼠标在任何区域移动都会驱动整卡倾斜和流光；标题、边框、插画与信息区保持同一平面。首页与详情均使用 Three.js 全息模型。详情支持拖动和方向键旋转、R 复位，Escape 或点击遮罩关闭。原生 dialog 提供焦点限制，关闭恢复触发按钮焦点。减少动态效果偏好会关闭自动闪烁和缓动。WebGL 或资源加载失败时保留静态图；访问 `/?static=1` 可检查静态预览。

字体优先使用 Google Fonts 的 Manrope / Noto Serif SC；离线时回退到系统中文字体。模型名称尚未确认，页面标注为“待补充”。

## 简约版 holo-card-studio 卡片

当前整卡使用 `cards/holo-minimal/` 的四层素材、Blender 工程和 GLB，通过 Three.js 全息着色器呈现；首页不再使用 CSS 虹彩叠层。图片、文字和背景均覆盖同一个卡体，文字采用固定 UV 保持排版稳定。原 HTML 信息继续提供无障碍语义，静态图作为加载及 WebGL 失败时的降级。

`node scripts/prepare-minimal-card.mjs` 从现有 SVG 封面与排版生成 PNG 图层（使用本机 bundled sharp）；修改内容后需同步该脚本的排版文字并重新生成。随后使用 `.agents/skills/holo-card-studio/scripts/run_pipeline.py` 构建，运行 `scripts/finish-minimal-card.py` 调整中性材质和渲染，最后运行 `node scripts/sync-minimal-card.mjs` 更新网页资源。旧黑金工程保留在 `cards/holo-forge/`。

## 卡片重制
当前卡片使用 `src/components/SkillCard.tsx` 与同目录 CSS，文字直接读取内容文件。旧 HoloStage 与着色器已移除；现版本采用 CSS 整卡流光与指针倾斜，无需 WebGL。历史 Blender 资源仍保留在探索成果中。

## Remotion 动画收藏（003）

画廊新增 `remotion-best-practices` 收藏，详情直接使用 `@remotion/player` 运行 `remotion-guide/src/Composition.tsx` 和 `Showcases.tsx`。不是 MP4 播放器，也不是 localhost:3000 的 iframe，因此只需启动画廊即可观看。

- 独立播放页：`/?video=remotion-guide`。
- 保留播放、暂停、拖动进度、音量、全屏及 11 个章节跳转；关闭详情后卸载播放器。
- 视频代码在打开播放器时才加载；普通收藏页不加载 Remotion 运行时。
- `scripts/sync-remotion.mjs` 在 `npm run dev` 和 `npm run build` 前将本地音频复制到 `public/audio/`。
- 修改视频内容直接编辑 `remotion-guide/src/`；修改帧率、尺寸或时长时，同步 `Root.tsx` 和 `video-settings.ts`，并更新播放器章节时间。
- Vite 对 React、Remotion 与媒体依赖去重，避免嵌套工程加载多个上下文实例。
- 卡片静态封面在 `public/cards/remotion-guide/cover.png`；实际播放不请求 MP4 文件。
