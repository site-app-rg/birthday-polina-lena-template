import { useEffect, useRef } from 'react'
import { surprisePhoto } from '../data/album'

type SurpriseModalProps = {
  onClose: () => void
  onOpenPhoto: (trigger: HTMLButtonElement) => void
  onToggleAudio: () => void
  onSeekAudio: (seconds: number) => void
  isAudioPlaying: boolean
  duration: number
  currentTime: number
  audioMessage: string
}

function timeLabel(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function SurpriseModal({ onClose, onOpenPhoto, onToggleAudio, onSeekAudio, isAudioPlaying, duration, currentTime, audioMessage }: SurpriseModalProps) {
  void onToggleAudio; void onSeekAudio; void isAudioPlaying; void duration; void currentTime; void timeLabel
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { closeButton.current?.focus() }, [])

  function keepFocus(event: React.KeyboardEvent) {
    if (event.key !== 'Tab' || !dialogRef.current) return
    const controls = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled])')]
    if (controls.length === 0) return
    if (event.shiftKey && document.activeElement === controls[0]) {
      event.preventDefault()
      controls[controls.length - 1].focus()
    } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
      event.preventDefault()
      controls[0].focus()
    }
  }

  return (
    <div className="surprise-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} className="surprise-card" role="dialog" aria-modal="true" aria-label="Видео для Полины" onKeyDown={keepFocus}>
        <button ref={closeButton} className="surprise-card__close" type="button" onClick={onClose} aria-label="Закрыть сюрприз">×</button>
        <span className="paper-tape surprise-card__tape" aria-hidden="true" />
        <button className="surprise-card__photo" type="button" onClick={(event) => onOpenPhoto(event.currentTarget)} aria-label="Посмотреть фотографию сюрприза целиком">
          <img src={surprisePhoto.src} alt={surprisePhoto.alt} />
        </button>
        <p className="surprise-card__note">С днём рождения, Полина!</p>
        <video className="surprise-video" src={`${import.meta.env.BASE_URL}media/birthday-video.mp4`} controls playsInline preload="metadata" />
        {audioMessage && <p className="surprise-card__message" role="status">{audioMessage}</p>}
      </div>
    </div>
  )
}
