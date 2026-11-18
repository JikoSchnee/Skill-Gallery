import {useRef} from 'react';
import {Player, type PlayerRef} from '@remotion/player';
import {Guide} from '../../remotion-guide/src/Composition';
import {videoSettings} from '../../remotion-guide/src/video-settings';

const chapters = [
  ['开场', 0], ['安装', 4], ['描述需求', 8], ['分镜', 12],
  ['图片运镜', 16], ['声画编辑', 20], ['动态标题', 24],
  ['镜头转场', 28], ['音乐字幕', 32], ['画幅适配', 36], ['导出', 40],
] as const;

export default function RemotionPreview() {
  const player = useRef<PlayerRef>(null);
  return <section className="remotion-preview" aria-label="Remotion 教学视频播放器">
    <Player ref={player} component={Guide}
      durationInFrames={videoSettings.durationInFrames}
      compositionWidth={videoSettings.width} compositionHeight={videoSettings.height}
      fps={videoSettings.fps} controls clickToPlay doubleClickToFullscreen
      initialFrame={60} style={{width:'100%', aspectRatio:'16 / 9', background:'#102d2b', borderRadius:10, overflow:'hidden'}}
      errorFallback={() => <div role="alert" className="player-status">视频加载失败，请刷新页面后重试。</div>}
    />
    <div className="player-meta"><span>44 秒 · 11 个章节</span><span>含音乐与音效</span></div>
    <nav className="video-chapters" aria-label="视频章节">{chapters.map(([label, second]) =>
      <button key={label} onClick={() => player.current?.seekTo(second * videoSettings.fps)} aria-label={`跳转到${label}，${second}秒`}>
        <span>{String(second).padStart(2,'0')}s</span>{label}
      </button>
    )}</nav>
  </section>;
}
