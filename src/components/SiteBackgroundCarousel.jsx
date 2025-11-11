import { useEffect, useMemo, useState } from 'react'

const DEFAULT_IMAGES = [
  '/IMG/1.jpg',
  '/IMG/2.jpg',
  '/IMG/3.jpg',
]

export default function SiteBackgroundCarousel({ images = DEFAULT_IMAGES, intervalMs = 7000 }) {
  const [index, setIndex] = useState(0)

  const reduceMotion = useMemo(() => {
    try {
      return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return false
    }
  }, [])

  useEffect(() => {
    // Preload subsequent images for smoother transitions
    const preload = images.slice(1).map((src) => {
      const img = new Image()
      img.src = src
      return img
    })
    return () => { preload.length = 0 }
  }, [images])

  useEffect(() => {
    if (reduceMotion || images.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs, reduceMotion])

  return (
    <div className="site-backdrop" aria-hidden="true">
      {images.map((src, i) => (
        <div
          key={src}
          className={`site-backdrop__slide ${i === index ? 'is-active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
      <div className="site-backdrop__overlay" />
    </div>
  )
}