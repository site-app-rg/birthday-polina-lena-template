import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { AlbumPhoto } from '../data/album'
import { albumPhotos, letterParagraphs } from '../data/album'
import { PaperConfetti } from './PaperConfetti'
import { HandDrawnFlower } from './HandDrawnFlower'
import { AlbumScrollHint } from './AlbumScrollHint'

type AlbumProps = {
  onBack: () => void
  onOpenPhoto: (photo: AlbumPhoto, trigger: HTMLButtonElement) => void
  onOpenSurprise: (trigger: HTMLButtonElement) => void
  onToggleMusic: () => void
  isMusicPlaying: boolean
  audioMessage: string
  modalOpen: boolean
}

const photo = (id: string) => albumPhotos.find((item) => item.id === id)!
const decorPath = (filename: string) => `${import.meta.env.BASE_URL}decor/${filename}`

function PhotoPrint({ item, caption, onOpen, className = '' }: { item: AlbumPhoto; caption?: string; onOpen: AlbumProps['onOpenPhoto']; className?: string }) {
  return (
    <button className={`photo-print ${className}`} type="button" onClick={(event) => onOpen(item, event.currentTarget)} aria-label={`Открыть фотографию: ${item.alt}`}>
      <span className="photo-print__image"><img src={item.src} alt="" loading="lazy" /></span>
      {caption && <span className="photo-print__caption">{caption}</span>}
    </button>
  )
}

function AlbumSequence({ onOpenPhoto, modalOpen }: Pick<AlbumProps, 'onOpenPhoto' | 'modalOpen'>) {
  const sequenceRef = useRef<HTMLElement>(null)
  const [turn, setTurn] = useState(0)

  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const sequence = sequenceRef.current
      if (!sequence) return
      const bounds = sequence.getBoundingClientRect()
      const travel = Math.max(1, bounds.height - window.innerHeight)
      const scrollPart = Math.max(0, Math.min(1, -bounds.top / travel))
      const next = Math.max(0, Math.min(1, (scrollPart - .22) / .56))
      setTurn((previous) => Math.abs(previous - next) > .004 ? next : previous)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const secondVisible = turn >= .5
  return (
    <section className={`album-sequence${secondVisible ? ' is-second' : ''}`} ref={sequenceRef} aria-label="Фотоальбом воспоминаний" data-turn-progress={turn.toFixed(2)}>
      <div className="album-sequence__stage">
        <AlbumScrollHint sectionRef={sequenceRef} modalOpen={modalOpen} />
        <PaperConfetti placement="album" />
        {/* Декор альбома Полины: новые прозрачные шары, подарок, ленты и букет; перелистывание и фотопросмотр не меняются. */}
        <img className="album-decor album-decor--lavender-bouquet" src={decorPath('lavender-bouquet.webp')} alt="" aria-hidden="true" />
        <img className="album-decor album-decor--balloons" src={decorPath('balloons-group-provence.webp')} alt="" aria-hidden="true" />
        <img className="album-decor album-decor--balloon" src={decorPath('balloon-milk-provence.webp')} alt="" aria-hidden="true" />
        <img className="album-decor album-decor--gift" src={decorPath('gift-box-provence.webp')} alt="" aria-hidden="true" />
        <img className="album-decor album-decor--ribbon-side" src={decorPath('ribbon-curl-lavender.webp')} alt="" aria-hidden="true" />
        <img className="album-decor album-decor--ribbon-bottom" src={decorPath('ribbon-long-lavender.webp')} alt="" aria-hidden="true" />
        <div className="album-book" style={{ '--turn-angle': `${-180 * turn}deg` } as CSSProperties}>
          <div className="book-page book-page--left album-book__left">
            <HandDrawnFlower className="album-book__flower album-book__flower--top" />
            <p className="album-book__caption album-book__caption--first" aria-label="Моменты, которые хочется помнить">{['Моменты,', 'которые хочется', 'помнить'].map(line => <span key={line}>{line}</span>)}</p>
            <p className="album-book__caption album-book__caption--second" aria-label="И сколько ещё впереди">{['И сколько ещё', 'впереди'].map(line => <span key={line}>{line}</span>)}</p>
            <HandDrawnFlower className="album-book__flower album-book__flower--bottom" />
          </div>
          <div className="book-page book-page--right album-book__under" inert={!secondVisible} aria-hidden={!secondVisible}>
            <PhotoPrint item={photo('03')} onOpen={onOpenPhoto} className="book-photo book-photo--first" />
            <PhotoPrint item={photo('04')} onOpen={onOpenPhoto} className="book-photo book-photo--second" />
          </div>
          <div className="book-page book-page--right album-book__leaf" inert={secondVisible} aria-hidden={secondVisible}>
            <PhotoPrint item={photo('01')} onOpen={onOpenPhoto} className="book-photo book-photo--first" />
            <PhotoPrint item={photo('02')} onOpen={onOpenPhoto} className="book-photo book-photo--second" />
          </div>
          <span className="album-book__binding" aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}

export function Album({ onBack, onOpenPhoto, onOpenSurprise, onToggleMusic, isMusicPlaying, audioMessage, modalOpen }: AlbumProps) {
  const letterRef = useRef<HTMLElement>(null)
  const [letterVisible, setLetterVisible] = useState(false)
  const [letterUnderControls, setLetterUnderControls] = useState(false)

  useEffect(() => {
    const letter = letterRef.current
    if (!letter) return
    const observer = new IntersectionObserver(([entry]) => setLetterVisible(entry.isIntersecting))
    observer.observe(letter)
    let frame = 0
    const measurePaper = () => {
      frame = 0
      const paper = letter.querySelector('.final-letter__paper')?.getBoundingClientRect()
      setLetterUnderControls(Boolean(paper && paper.top < 76 && paper.bottom > 0))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measurePaper) }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    measurePaper()
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <main className={`card-story${letterVisible && letterUnderControls ? ' card-story--reading-letter' : ''}`}>
      <button className="story-return" type="button" onClick={onBack} aria-label="Вернуться к обложке">←</button>
      <div className="story-paper">
        <AlbumSequence onOpenPhoto={onOpenPhoto} modalOpen={modalOpen} />

        <section className="collage collage--transition" aria-label="Тёплые моменты">
          <PaperConfetti placement="transition" />
          <span className="collage-note collage-note--transition">Тёплые<br />мгновения <HandDrawnFlower className="collage-note__flower" /></span>
          <PhotoPrint item={photo('12')} caption="♡" onOpen={onOpenPhoto} className="collage-photo collage-photo--12" />
          <PhotoPrint item={photo('14')} onOpen={onOpenPhoto} className="collage-photo collage-photo--14" />
          <PhotoPrint item={photo('15')} caption="И ещё столько впереди ♡" onOpen={onOpenPhoto} className="collage-photo collage-photo--15" />
          <img className="collage__ribbon collage__ribbon--transition" src={decorPath('ribbon-long-lavender.webp')} alt="" aria-hidden="true" loading="lazy" />
        </section>

        <section className="collage collage--together" aria-label="Воспоминания вместе">
          <PaperConfetti placement="together" />
          <PhotoPrint item={photo('06')} onOpen={onOpenPhoto} className="collage-photo collage-photo--06" />
          <PhotoPrint item={photo('07')} onOpen={onOpenPhoto} className="collage-photo collage-photo--07" />
          <span className="collage-note collage-note--together">Друзья<br />всегда рядом ♡</span>
          <PhotoPrint item={photo('09')} onOpen={onOpenPhoto} className="collage-photo collage-photo--09" />
          <PhotoPrint item={photo('10')} caption="Вместе" onOpen={onOpenPhoto} className="collage-photo collage-photo--10" />
          <PhotoPrint item={photo('13')} onOpen={onOpenPhoto} className="collage-photo collage-photo--13" />
          <PhotoPrint item={photo('11')} caption="Тёплые моменты" onOpen={onOpenPhoto} className="collage-photo collage-photo--11" />
          <img className="collage__ribbon collage__ribbon--together" src={decorPath('ribbon-curl-lavender.webp')} alt="" aria-hidden="true" loading="lazy" />
          <img className="collage__gift" src={decorPath('gift-box-provence.webp')} alt="" aria-hidden="true" loading="lazy" />
          <img className="collage__lavender" src={decorPath('lavender-composition.webp')} alt="" aria-hidden="true" loading="lazy" />
        </section>

        <section className="extra-gallery" aria-label="Все фотографии Полины"><h2>Наши фотографии</h2><div className="extra-gallery__grid">{albumPhotos.filter(item => item.id === '08' || Number(item.id) >= 16).map(item => <PhotoPrint key={item.id} item={item} onOpen={onOpenPhoto} />)}</div></section>
        <section className="final-letter" ref={letterRef} aria-label="Поздравительное письмо">
          <PaperConfetti placement="letter" />
          <PhotoPrint item={photo('05')} onOpen={onOpenPhoto} className="final-letter__photo" />
          <article className="final-letter__paper">
            <span className="paper-tape final-letter__tape" aria-hidden="true" />
            <div className="final-letter__text">{letterParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
            <span className="final-letter__heart" aria-hidden="true">♡</span>
          </article>
          <img className="final-letter__ribbon" src={decorPath('ribbon-curl-lavender.webp')} alt="" aria-hidden="true" loading="lazy" />
          <img className="final-letter__lavender" src={decorPath('lavender-sprig.webp')} alt="" aria-hidden="true" loading="lazy" />
        </section>

        <section className="envelope-section" aria-label="Конверт-сюрприз">
          <PaperConfetti placement="envelope" />
          <p className="envelope-section__note">Открой маленький<br />сюрприз ♡</p>
          <svg className="envelope-section__arrow" viewBox="0 0 390 430" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="envelope-arrow-outline" x1="0" y1="145" x2="0" y2="214" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFCF5" stopOpacity="0" />
                <stop offset="1" stopColor="#FFFCF5" stopOpacity=".95" />
              </linearGradient>
            </defs>
            <path d="M75 78C20 101 18 164 62 193C87 210 116 214 139 232M139 232l-14-2M139 232l-5-13" fill="none" stroke="url(#envelope-arrow-outline)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M75 78C20 101 18 164 62 193C87 210 116 214 139 232M139 232l-14-2M139 232l-5-13" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <img className="envelope-section__ribbon" src={decorPath('ribbon-curl-lavender.webp')} alt="" aria-hidden="true" loading="lazy" />
          <img className="envelope-section__gift" src={decorPath('gift-box-provence.webp')} alt="" aria-hidden="true" loading="lazy" />
          <button className="surprise-envelope" type="button" onClick={(event) => onOpenSurprise(event.currentTarget)} aria-label="Открыть сюрприз">
            <img className="surprise-envelope__image" src={decorPath('envelope-provence.webp')} width={925} height={620} alt="" aria-hidden="true" loading="lazy" />
          </button>
        </section>
      </div>

      {false && <div className={`music-control${letterVisible ? ' music-control--letter' : ''}`}>
        <button type="button" onClick={onToggleMusic} aria-label={isMusicPlaying ? 'Приостановить музыку' : 'Включить музыку'} title={isMusicPlaying ? 'Приостановить музыку' : 'Включить музыку'}>
          {isMusicPlaying ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5v17l14-8.5z" fill="currentColor" /></svg>}
        </button>
        {audioMessage && <span className="music-control__message" role="status">{audioMessage}</span>}
      </div>}
    </main>
  )
}

