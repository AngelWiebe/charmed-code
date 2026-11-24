import { useEffect } from 'react'
import castleMobile from '../assets/journey-scene-mobile.webp'
import castle from '../assets/journey-scene.webp'
import { experience } from '../data'

export function useCastleMotion(ref) {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: no-preference)')
    let active = true
    let motion

    async function syncMotion() {
      motion?.revert()
      motion = undefined
      if (!preference.matches) return

      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (!active || !preference.matches || motion) return

        gsap.registerPlugin(ScrollTrigger)
        motion = gsap.context(() => {
          gsap.fromTo('.castle-landscape', { scale: 1.01 }, {
            scale: 1.16,
            ease: 'none',
            scrollTrigger: {
              trigger: '.castle-valley',
              start: 'top bottom',
              endTrigger: '#experience',
              end: 'bottom center',
              scrub: true,
            },
          })
        }, ref.current)
      } catch (error) {
        console.warn('Castle scroll effects could not start.', error)
      }
    }

    syncMotion()
    preference.addEventListener('change', syncMotion)
    return () => {
      active = false
      preference.removeEventListener('change', syncMotion)
      motion?.revert()
    }
  }, [ref])
}

export function CastleValley({ children }) {
  return (
    <div className="castle-valley">
      <picture className="castle-backdrop" aria-hidden="true">
        <source media="(max-width: 720px)" srcSet={castleMobile} />
        <img className="castle-landscape" src={castle} alt="" loading="lazy" decoding="async" />
      </picture>
      {children}
    </div>
  )
}

export function Experience() {
  return (
    <section className="castle-courtyard" id="experience" aria-labelledby="experience-title">
      <div className="wrap experience-panel">
        <div className="experience-intro">
          <h2 id="experience-title" className="nav-target" tabIndex={-1}>Notable Experience</h2>
          <p>Past professional work on e-commerce, marketing, and trading platforms.</p>
        </div>
        <ul className="experience-grid">
          {experience.map(({ name, detail, logo }) => (
            <li key={name}>
              <h3><img src={logo} alt={name} loading="lazy" /></h3>
              <p>{detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
