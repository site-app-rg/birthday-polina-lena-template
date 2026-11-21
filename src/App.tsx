import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { OpeningConfetti } from './components/OpeningConfetti'
import { Album } from './components/Album'
import { CardCover } from './components/CardCover'
import { PhotoLightbox } from './components/PhotoLightbox'
import { SurpriseModal } from './components/SurpriseModal'
import { albumPhotos, mainSong, surprisePhoto, surpriseSong } from './data/album'
import type { AlbumPhoto } from './data/album'

type LightboxState = { photo: AlbumPhoto; source: 'album' | 'surprise' } | null

export default function App() {
  const [opened, setOpened] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const finishCelebrating = useCallback(() => setCelebrating(false), [])
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [isSurprisePlaying, setIsSurprisePlaying] = useState(false)
  const [surpriseOpen, setSurpriseOpen] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const [audioMessage, setAudioMessage] = useState('')
  const [surpriseAudioMessage, setSurpriseAudioMessage] = useState('')
  const [surpriseDuration, setSurpriseDuration] = useState(0)
  const [surpriseTime, setSurpriseTime] = useState(0)
  const mainAudioRef = useRef<HTMLAudioElement>(null)
  const surpriseAudioRef = useRef<HTMLAudioElement>(null)
  const wasMusicPlayingRef = useRef(false)
  const photoTriggerRef = useRef<HTMLButtonElement | null>(null)
  const envelopeTriggerRef = useRef<HTMLButtonElement | null>(null)
  const modalOpen = Boolean(lightbox || surpriseOpen)

  useLayoutEffect(() => {
    if (mainAudioRef.current) mainAudioRef.current.volume = 0.5
    if (surpriseAudioRef.current) surpriseAudioRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    if (opened) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [opened])

  useEffect(() => {
    if (!modalOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [modalOpen])

  function playMainMusic() {
    const audio = mainAudioRef.current
    if (!audio) return
    setAudioMessage('')
    void audio.play().catch(() => setAudioMessage('Нажми на кнопку музыки, чтобы включить песню.'))
  }

  function openCard() {
    setCelebrating(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setOpened(true)
  }

  function backToCover() {
    setCelebrating(false)
    mainAudioRef.current?.pause()
    setOpened(false)
    setAudioMessage('')
  }

  function toggleMusic() {
    const audio = mainAudioRef.current
    if (!audio) return
    if (audio.paused) playMainMusic()
    else audio.pause()
  }

  function openPhoto(photo: AlbumPhoto, trigger: HTMLButtonElement) {
    photoTriggerRef.current = trigger
    setLightbox({ photo, source: 'album' })
  }

  function openSurprisePhoto(trigger: HTMLButtonElement) {
    photoTriggerRef.current = trigger
    setLightbox({ photo: surprisePhoto, source: 'surprise' })
  }

  function closeLightbox() {
    setLightbox(null)
    requestAnimationFrame(() => photoTriggerRef.current?.focus())
  }

  function movePhoto(direction: -1 | 1) {
    if (!lightbox || lightbox.source !== 'album') return
    const currentIndex = albumPhotos.findIndex((photo) => photo.id === lightbox.photo.id)
    const nextIndex = (currentIndex + direction + albumPhotos.length) % albumPhotos.length
    setLightbox({ photo: albumPhotos[nextIndex], source: 'album' })
  }

  function openSurprise(trigger: HTMLButtonElement) {
    envelopeTriggerRef.current = trigger
    const mainAudio = mainAudioRef.current
    wasMusicPlayingRef.current = Boolean(mainAudio && !mainAudio.paused && !mainAudio.ended)
    mainAudio?.pause()
    setSurpriseOpen(true)
    setSurpriseAudioMessage('')
    const audio = surpriseAudioRef.current
    if (audio) {
      audio.currentTime = 0
      setSurpriseTime(0)
      void audio.play().catch(() => setSurpriseAudioMessage('Нажми Play, чтобы включить поздравление.'))
    }
  }

  function closeSurprise() {
    const audio = surpriseAudioRef.current
    audio?.pause()
    if (audio) audio.currentTime = 0
    setSurpriseOpen(false)
    if (wasMusicPlayingRef.current) playMainMusic()
    wasMusicPlayingRef.current = false
    requestAnimationFrame(() => envelopeTriggerRef.current?.focus())
  }

  function toggleSurpriseAudio() {
    const audio = surpriseAudioRef.current
    if (!audio) return
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0
      setSurpriseAudioMessage('')
      void audio.play().catch(() => setSurpriseAudioMessage('Не удалось включить аудио на этом устройстве.'))
    } else audio.pause()
  }

  function seekSurpriseAudio(seconds: number) {
    const audio = surpriseAudioRef.current
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return
    const time = Math.max(0, Math.min(audio.duration, seconds))
    audio.currentTime = time
    setSurpriseTime(time)
  }

  useEffect(() => {
    if (!lightbox && !surpriseOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (lightbox) closeLightbox()
        else closeSurprise()
      } else if (lightbox?.source === 'album' && event.key === 'ArrowLeft') movePhoto(-1)
      else if (lightbox?.source === 'album' && event.key === 'ArrowRight') movePhoto(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <>
      {mainSong && <audio ref={mainAudioRef} src={mainSong} preload="metadata" onPlay={() => { setIsMusicPlaying(true); setAudioMessage('') }} onPause={() => setIsMusicPlaying(false)} onEnded={() => setIsMusicPlaying(false)} onError={() => setAudioMessage('Не удалось загрузить песню.')} />}
      {surpriseSong && <audio id="surprise-audio" ref={surpriseAudioRef} src={surpriseSong} preload="metadata" onLoadedMetadata={(event) => setSurpriseDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setSurpriseTime(event.currentTarget.currentTime)} onPlay={() => { setIsSurprisePlaying(true); setSurpriseAudioMessage('') }} onPause={() => setIsSurprisePlaying(false)} onEnded={() => setIsSurprisePlaying(false)} onError={() => setSurpriseAudioMessage('Не удалось загрузить аудио.')} />}

      {opened ? <Album onBack={backToCover} onOpenPhoto={openPhoto} onOpenSurprise={openSurprise} onToggleMusic={toggleMusic} isMusicPlaying={isMusicPlaying} audioMessage={audioMessage} modalOpen={modalOpen} /> : <CardCover onOpen={openCard} />}

      {celebrating && <OpeningConfetti onComplete={finishCelebrating} />}

      {surpriseOpen && <SurpriseModal onClose={closeSurprise} onOpenPhoto={openSurprisePhoto} onToggleAudio={toggleSurpriseAudio} onSeekAudio={seekSurpriseAudio} isAudioPlaying={isSurprisePlaying} duration={surpriseDuration} currentTime={surpriseTime} audioMessage={surpriseAudioMessage} />}
      {lightbox && <PhotoLightbox photo={lightbox.photo} hasNavigation={lightbox.source === 'album'} onClose={closeLightbox} onPrevious={() => movePhoto(-1)} onNext={() => movePhoto(1)} />}
    </>
  )
}
