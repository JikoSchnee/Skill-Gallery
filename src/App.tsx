import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { assetUrl, entries, type GalleryEntry } from './data/entries';
import SkillCard from './components/SkillCard';
const RemotionPreview = lazy(() => import('./components/RemotionPreview'));
const VideoPlayer = () => <Suspense fallback={<div className="player-status" role="status">正在加载动画播放器…</div>}><RemotionPreview /></Suspense>;
const dateLabel = (date: string) => date.replaceAll('-', '.');
function Mark({ small = false }: { small?: boolean }) {
  return <svg className={small ? 'mark small' : 'mark'} viewBox="0 0 40 44" fill="none" aria-hidden="true"><path d="M20 2 37 12v20L20 42 3 32V12Z" stroke="currentColor"/><path d="m20 10 10 12-10 12-10-12Z" stroke="currentColor"/><path d="M20 10v24M10 22h20" stroke="currentColor" opacity=".5"/></svg>;
}
function Detail({ entry, onClose, returnFocus }: { entry: GalleryEntry; onClose: () => void; returnFocus: HTMLButtonElement | null }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const demo = entry.results.find(result => result.kind === 'demo');
  const video = entry.results.find(result => result.kind === 'remotion');
  useEffect(() => {
    const previous = returnFocus;
    const modal = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modal?.showModal();
    return () => { modal?.close(); document.body.style.overflow = overflow; previous?.focus({ preventScroll: true }); };
  }, []);
  return <dialog ref={dialog} className={`detail-dialog${video ? ' video-detail' : ''}`} aria-labelledby="detail-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="detail-shell"><button className="close-button" onClick={onClose} aria-label="关闭详情" autoFocus>×</button>
      <div className={`detail-preview${demo ? ' demo-preview' : video ? ' video-preview' : ''}`}><div className="preview-label"><Mark small/><span>COLLECTION / {entry.number}</span><span>✦</span></div>
        {video ? <><VideoPlayer/><a className="demo-open" href={assetUrl(video.url)} target="_blank" rel="noreferrer">独立打开播放器 ↗</a></> : demo ? <><iframe className="result-demo" src={assetUrl(demo.url)} title={`${entry.skill} 交互成果`} allow="fullscreen" allowFullScreen/><a className="demo-open" href={assetUrl(demo.url)} target="_blank" rel="noreferrer">独立打开演示 ↗</a></> : <><div className="large-stage"><SkillCard entry={entry}/></div><p className="interaction-hint">移动指针，探索卡片上的光影</p><div className="preview-bottom">HOLOGRAPHIC FOIL <span>{entry.number} — SKILL GALLERY</span></div></>}
      </div>
      <div className="detail-content"><span className="eyebrow">EXPLORATION {entry.number}</span><h2 id="detail-title">{entry.skill}</h2><p className="detail-subtitle">{entry.title}</p><div className="tags">{entry.tags.map(tag => <span key={tag}>{tag}</span>)}</div><p className="description">{entry.description}</p>
        <dl className="detail-metadata"><div><dt>使用模型</dt><dd>{entry.model ?? '待补充'}</dd></div><div><dt>尝试日期</dt><dd>{dateLabel(entry.date)}</dd></div></dl>
        <section><h3><span>01</span> 探索成果</h3><div className="result-images">{entry.results.filter(r => r.kind === 'image').map(r => <a key={r.url} href={assetUrl(r.url)} target="_blank" rel="noreferrer"><img src={assetUrl(r.url)} alt={r.title} loading="lazy"/><span>{r.title} ↗</span></a>)}</div><div className="downloads">{entry.results.filter(r => r.kind === 'demo' || r.kind === 'remotion').map(r => <a key={r.url} href={assetUrl(r.url)} target="_blank" rel="noreferrer">{r.title} ↗</a>)}{entry.results.filter(r => r.kind === 'link').map(r => <a key={r.url} href={assetUrl(r.url)} download>{r.title} ↓</a>)}</div></section>
        <section><h3><span>02</span> 制作过程</h3><ol className="process">{entry.process.map(p => <li key={p.title}><h4>{p.title}</h4><p>{p.text}</p></li>)}</ol></section>
        <section><h3><span>03</span> 尝试心得</h3><p className="reflection">{entry.reflection ?? '留一点空白，等待这次探索的真实感受。'}</p></section>
        <a className="source-link" href={entry.source} target="_blank" rel="noreferrer">查看 Skill 源码 <span>GITHUB ↗</span></a>
      </div>
    </div>
  </dialog>;
}
function Gallery() {
  const [selected, setSelected] = useState<GalleryEntry | null>(null);
  const [columns, setColumns] = useState(1);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = grid.current!;
    const measure = () => setColumns(getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length || 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  const fillers = entries.length ? (columns - entries.length % columns) % columns : 0;
  return <><main className="cards-only" aria-label="Skill 收藏"><div className="cards-grid" ref={grid}>
    {entries.map(entry => <SkillCard key={entry.id} entry={entry} onOpen={button => { trigger.current = button; setSelected(entry); }}/>)}
    {Array.from({ length: fillers }, (_, index) => <div className="card-filler" key={`back-${index}`} aria-hidden="true" onPointerMove={event => { if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return; const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width; const y = (event.clientY - rect.top) / rect.height; const style = (event.currentTarget.firstElementChild as HTMLElement).style; style.setProperty('--rx', `${(.5-y)*9}deg`); style.setProperty('--ry', `${(x-.5)*12}deg`); style.setProperty('--mx', `${x*100}%`); style.setProperty('--my', `${y*100}%`); }} onPointerLeave={event => (event.currentTarget.firstElementChild as HTMLElement)?.removeAttribute('style')}><div className="skill-card is-back"><div className="skill-card-back"><span className="card-back-logo"/></div></div></div>)}
  </div></main>{selected && <Detail entry={selected} returnFocus={trigger.current} onClose={() => setSelected(null)} />}</>;
}

export default function App() {
  if (new URLSearchParams(window.location.search).get('video') === 'remotion-guide') {
    return <main className="video-page"><a className="video-back" href={window.location.pathname}>← 返回 Skill Gallery</a><header><span className="eyebrow">EXPLORATION 003 / REMOTION</span><h1>让一个想法，动起来。</h1><p>用具体的动画，认识 remotion-best-practices。</p></header><VideoPlayer/></main>;
  }
  return <Gallery/>;
}
