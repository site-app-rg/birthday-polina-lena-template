import { useRef, useState } from 'react'
import type { TouchEvent } from 'react'
import type { AlbumPhoto } from '../data/album'
import { sliderPhotos } from '../data/album'

// Слайдер открытки Полины: на месте прежней сетки показан один снимок; стрелки и свайпы листают девять фото вручную, нажатие открывает действующий фотопросмотр.
export function PhotoSlider({ onOpenPhoto }: { onOpenPhoto: (photo: AlbumPhoto, trigger: HTMLButtonElement) => void }) {
  const [index, setIndex] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const current = sliderPhotos[index]

  function move(direction: number) {
    setIndex((previous) => (previous + direction + sliderPhotos.length) % sliderPhotos.length)
  }

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.changedTouches[0]
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null
  }

  function onTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStart.current === null) return
    const delta = event.changedTouches[0].clientX - touchStart.current.x
    const vertical = event.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (Math.abs(delta) < 40 || Math.abs(delta) < Math.abs(vertical) * 1.2) return
    suppressClick.current = true
    move(delta < 0 ? 1 : -1)
    window.setTimeout(() => { suppressClick.current = false }, 350)
  }

  return (
    <section className="photo-slider" aria-label="Наши фотографии" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <h2>Наши фотографии</h2>
      <div className="photo-slider__row">
        <button className="photo-slider__arrow" type="button" onClick={() => move(-1)} aria-label="Предыдущая фотография">‹</button>
        <div className="photo-slider__stage" aria-live="polite">
          <button key={current.id} className="photo-print photo-slider__print" type="button" aria-label={`Открыть фотографию: ${current.alt}`} onClick={(event) => { if (!suppressClick.current) onOpenPhoto(current, event.currentTarget) }}>
            <span className="photo-print__image"><img src={current.src} alt="" /></span>
          </button>
        </div>
        <button className="photo-slider__arrow" type="button" onClick={() => move(1)} aria-label="Следующая фотография">›</button>
      </div>
      <p className="photo-slider__count" aria-label={`Фотография ${index + 1} из ${sliderPhotos.length}`}>{index + 1} / {sliderPhotos.length}</p>
    </section>
  )
}
