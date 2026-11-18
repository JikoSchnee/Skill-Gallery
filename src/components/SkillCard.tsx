import { useRef, useState, type PointerEvent } from 'react';
import { assetUrl, type GalleryEntry } from '../data/entries';
import './SkillCard.css';

/** A single readable card face; light follows the pointer across its entire surface. */
export default function SkillCard({ entry, onOpen }: { entry: GalleryEntry; onOpen?: (button: HTMLButtonElement) => void }) {
  const [showBack, setShowBack] = useState(false);
  const face = useRef<HTMLDivElement>(null);
  const artwork = useRef<HTMLDivElement>(null);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    const card = face.current!;
    card.dataset.tracking = 'true';
    const style = card.style;
    style.setProperty('--rx', `${(0.5 - y) * 9}deg`);
    style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    style.setProperty('--mx', `${x * 100}%`);
    style.setProperty('--my', `${y * 100}%`);
    // Layout offsets remain stable while the visible face rotates.
    const art = artwork.current!;
    const artLeft = bounds.left + card.offsetLeft + card.clientLeft + art.offsetLeft;
    const artTop = bounds.top + card.offsetTop + card.clientTop + art.offsetTop;
    const artX = Math.max(0, Math.min(1, (event.clientX - artLeft) / art.offsetWidth));
    const artY = Math.max(0, Math.min(1, (event.clientY - artTop) / art.offsetHeight));
    style.setProperty('--art-x', `${artX * 100}%`);
    style.setProperty('--art-y', `${artY * 100}%`);
  };
  const reset = () => {
    if (!face.current) return;
    delete face.current.dataset.tracking;
    face.current.removeAttribute('style');
  };
  return <div className="skill-card-view"><div className="skill-card-space" onPointerMove={move} onPointerLeave={reset} onPointerCancel={reset}>
    <div className={`skill-card${showBack ? ' is-back' : ''}`} ref={face}>
      <div className="skill-card-front" aria-hidden={showBack}>
      <div className="skill-card-top"><span className="skill-card-symbol">✳</span><h2>{entry.skill}</h2><span className="skill-card-id">{entry.number}</span></div>
      <div className="skill-card-art" ref={artwork}><img src={assetUrl(entry.cover ?? entry.artwork)} alt={`${entry.skill} · ${entry.title}`} draggable={false}/><div className="art-holo" aria-hidden="true"/><div className="art-sparkles" aria-hidden="true"/><div className="art-highlight" aria-hidden="true"/></div>
      <div className="skill-card-caption"><span>EXPERIMENT / {entry.number}</span><span>HOLOGRAPHIC</span></div>
      <div className="skill-card-copy"><h3>{entry.title}</h3><p>{entry.description}</p></div>
      <dl className="skill-card-facts"><div><dt>使用模型</dt><dd>{entry.model ?? '待补充'}</dd></div><div><dt>尝试日期</dt><dd>{entry.date.replaceAll('-', '.')}</dd></div></dl>
      <div className="skill-card-bottom"><span>SKILL GALLERY</span><span>{onOpen ? '查看完整记录 ↗' : '一次探索，一张收藏。'}</span></div>
      </div>
      {showBack && <div className="skill-card-back" role="img" aria-label="渐变卡背，中央为米色镂空标志"><span className="card-back-logo"/></div>}
      <div className="skill-card-light" aria-hidden="true"/>
      {onOpen && <button className="skill-card-open" onClick={e => onOpen(e.currentTarget)} aria-label={`查看 ${entry.skill} 的完整探索记录`}/>}
    </div>
  </div>{!onOpen && <button className="card-side-toggle" aria-pressed={showBack} onClick={() => { reset(); setShowBack(value => !value); }}>{showBack ? '查看正面 ↻' : '查看卡背 ↻'}</button>}</div>;
}
