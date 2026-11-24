import { useLanguage } from '../language'
import { useEffect, useRef, useState } from 'react'
import { testimonials } from '../data'

export default function Testimonials() {
  const { t } = useLanguage()
  const [index, setIndex] = useState(0)
  const quoteRef = useRef(null)
  const firstRender = useRef(true)
  const item = testimonials[index]

  function step(direction) {
    setIndex((current) => (current + direction + testimonials.length) % testimonials.length)
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const quote = quoteRef.current
    if (!quote || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    quote.style.animation = 'none'
    void quote.offsetWidth
    quote.style.animation = ''
  }, [index])

  function onKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  return (
    <section id="kind-words" className="testimonials" aria-roledescription={t("carousel")} aria-labelledby="kind-words-title" onKeyDown={onKeyDown}>
      <div className="carousel">
        <h2 className="section-kicker nav-target" id="kind-words-title" tabIndex={-1}>{t("Kind words")}</h2>
        <div className="quote-wrap">
          <button className="arrow arrow-prev" type="button" onClick={() => step(-1)} aria-label={t("Previous testimonial")} />
          <blockquote ref={quoteRef} className="quote" aria-live="polite" aria-atomic="true">
            <p>“{t(item.quote)}”</p>
            <footer>— {t(item.name)}</footer>
            <p className="sr-only">{t('Testimonial {number} of {total}', { number: index + 1, total: testimonials.length })}</p>
          </blockquote>
          <button className="arrow arrow-next" type="button" onClick={() => step(1)} aria-label={t("Next testimonial")} />
        </div>
        <p className="quote-count" aria-hidden="true">{t('{number} of {total}', { number: index + 1, total: testimonials.length })}</p>
        <div className="dots" role="group" aria-label={t("Choose a testimonial")}>
          {testimonials.map((entry, dotIndex) => (
            <button
              key={entry.name}
              className="dot"
              type="button"
              onClick={() => setIndex(dotIndex)}
              aria-current={dotIndex === index ? 'true' : undefined}
              aria-label={t('Show testimonial from {name}', { name: t(entry.name) })}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
