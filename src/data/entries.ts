export interface GalleryEntry {
  id: string; number: string; skill: string; source: string; title: string;
  summary: string; description: string; model: string | null; date: string;
  tags: string[]; cover?: string; artwork: string; config: string;
  results: { title: string; url: string; kind: 'image' | 'link' | 'demo' | 'remotion' }[];
  process: { title: string; text: string }[]; reflection: string | null;
}
export const assetUrl = (path: string) => path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path;
export const entries: GalleryEntry[] = [{
  id: 'holo-forge-001', number: '001', skill: 'holo-card-studio',
  source: 'https://github.com/EverettFish/holo-card-studio', title: '将灵感，铸成光。',
  summary: '一次关于材质、光线与想象力的探索。',
  description: '用 holo-card-studio 将黑金工坊的想象，转化为一张可以转动、随视角流光的全息收藏卡。这也是 Skill Gallery 的第一件藏品：用制作卡片的 Skill，记录制作卡片这件事。',
  model: 'GPT-6 Astra Medium', date: '2026-10-21', tags: ['3D 全息', '图像生成', '创意编程'],
  cover: '/cards/holo-forge/cover.svg', artwork: '/cards/holo-minimal/preview.png', config: '/cards/holo-minimal/card-config.json',
  results: [
    { title: '简约全息卡片', url: '/cards/holo-minimal/preview.png', kind: 'image' },
    { title: '下载简约版 Blender 工程', url: '/cards/holo-minimal/card.blend', kind: 'link' },
    { title: '正面预览', url: '/cards/holo-forge/preview.png', kind: 'image' },
    { title: 'Blender 渲染', url: '/cards/holo-forge/hero.png', kind: 'image' },
    { title: '下载 Blender 工程', url: '/cards/holo-forge/card.blend', kind: 'link' },
    { title: '下载 3D 模型', url: '/cards/holo-forge/card.glb', kind: 'link' },
  ],
  process: [
    { title: '构思 · 全息锻造工坊', text: '以黑曜石、黄铜结构和悬浮卡片为视觉线索，生成环境与透明主体两层插画。' },
    { title: '制作 · 为光赋予层次', text: '使用 holo-card-studio 的分层流程组织背景、主体、线稿与文字，生成 Blender 场景和网页模型。' },
    { title: '呈现 · 收藏一次探索', text: '将原项目的 Three.js 全息着色器接入展柜，保留视差、流光与闪烁细节。' },
  ], reflection: null,
}, {
  id: 'anatomy-sr6-002', number: '002', skill: 'anatomy',
  source: 'https://github.com/wheresryan22/anatomy', title: '拆开想象，看见运转。',
  summary: '从青蓝外壳到绿色核心，一次可交互的机械解剖。',
  description: '用 anatomy 探索虚构缩小射线装置：从青蓝外壳深入核心、能量匣与光学组件，让半剖观察、机械联动和爆炸视图成为理解结构的入口。',
  model: 'GPT-6 Astra Medium', date: '2026-10-23', tags: ['三维交互', '机械联动', '爆炸视图'],
  cover: '/cards/anatomy-sr6/cover.png?v=2', artwork: '/cards/anatomy-sr6/cover.png?v=2', config: '',
  results: [
    { title: '打开三维交互演示', url: '/demos/anatomy-sr6/index.html', kind: 'demo' },
    { title: '半剖结构 · 重新取景', url: '/cards/anatomy-sr6/cover.png?v=2', kind: 'image' },
  ],
  process: [
    { title: '造型 · 从外壳到内部', text: '围绕虚构缩小射线装置建立青蓝外壳、贯通风扇壳体、尾部能量匣与中央核心，逐步确认内部布局。' },
    { title: '联动 · 让结构动起来', text: '区分充能射击与能量匣替换，加入风扇同步旋转、尾盖开合、绿色核心发光和组件爆炸展开。' },
    { title: '观察 · 把控制权交给观看者', text: '加入三档外壳、深浅主题、随视角转动的三维坐标轴，以及可拖动收起的操作窗。封面取自实际运行的半剖模型。' },
  ], reflection: '逐步确认外观、内部布局和动作，比一次性堆叠功能更容易发现穿模与联动问题。这里的内部机构是用于交互展示的原创虚构设计，并非电影官方结构。',
}, {
  id: 'remotion-guide-003', number: '003', skill: 'remotion-best-practices',
  source: 'https://github.com/remotion-dev/skills', title: '让一个想法，动起来。',
  summary: '用代码制作视频，用动画展示技能。',
  description: '一支 44 秒的 Remotion 教程：从安装、需求和分镜，到图片运镜、动态标题、镜头转场、音乐字幕与画幅适配。每段 4 秒，直接播放可编辑的 React 动画。',
  model: 'GPT-6 Astra Medium', date: '2026-10-26', tags: ['代码视频', '动态图形', '音乐与字幕'],
  cover: '/cards/remotion-guide/cover.png', artwork: '/cards/remotion-guide/cover.png', config: '',
  results: [{title: '独立打开动画播放器', url: '?video=remotion-guide', kind: 'remotion'}],
  process: [
    {title: '安装 · 把制作规范带进项目', text: '安装项目级 remotion-best-practices，建立独立 Remotion 工程与中文分步教程。'},
    {title: '迭代 · 从文字卡片到动画演示', text: '加入山景视差、推近镜头、动态标题、城市转场、节拍图形、逐词高亮字幕和画幅变化，并将每段统一为 4 秒。'},
    {title: '接入 · 在画廊里播放代码', text: '使用 Remotion Player 直接加载同一套 React 视频源码，支持播放、进度拖动、音量、全屏和章节跳转。'},
  ],
  reflection: '只有文字切换容易像幻灯片。让用途成为实际动画，再用节奏、音乐和音效串联，才能清楚展示这个技能可以做什么。',
}, {
  id: 'algorithmic-art-004', number: '004', skill: 'algorithmic-art',
  source: 'https://github.com/anthropics/skills/tree/main/skills/algorithmic-art', title: '让规则，生长成风景。',
  summary: '三种算法，三幅可以交互的生成艺术。',
  description: '用 algorithmic-art 探索流动的粒子、相遇的波与递归生长的植物。切换作品，调整参数和色彩，让每一次运算生成不同的风景。',
  model: 'GPT-6 Astra High', date: '2026-10-28', tags: ['生成艺术', '交互实验', '创意编程'],
  cover: '/cards/algorithmic-art/cover.png', artwork: '/cards/algorithmic-art/cover.png', config: '',
  results: [
    { title: '打开三个交互作品', url: '/demos/algorithmic-art/index.html?piece=flow', kind: 'demo' },
    { title: '流绸 · 粒子流场', url: '/cards/algorithmic-art/cover.png', kind: 'image' },
  ],
  process: [
    { title: '流绸 · 看见流动', text: '将粒子放入不断变化的向量场，用细线累积流动的轨迹；按住画面可拨动附近流线。' },
    { title: '相织 · 波的相遇', text: '用多个波源的相位叠加生成干涉纹样，调整波源数量、间距、频率与颜色。' },
    { title: '枝语 · 递归生长', text: '让枝条逐层分裂、生长和长叶，种子与分枝参数共同决定每棵植物的形态。' },
  ],
  reflection: '同一组规则可以生成许多不同的作品。保留种子与参数，让喜欢的结果可以重现，也让探索过程成为作品的一部分。',
}] satisfies GalleryEntry[];
entries.sort((a, b) => a.number.localeCompare(b.number));
