import { useEffect, useRef, useState } from 'react'
import { projects } from '../data'
import { previews } from './Marks'

const crescentArc = 'M 27 4 C 10 5 5 23 16 34 C 23 41 35 39 41 32'

export default function Work({ onOpen, visits }) {
  const ornamentRef = useRef(null)
  const [tracedVisit, setTracedVisit] = useState(0)

  useEffect(() => {
    if (!visits || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ornament = ornamentRef.current
    let settleTimer

    function stopWatching() {
      window.clearTimeout(settleTimer)
      window.removeEventListener('scroll', waitForScrollToSettle)
    }

    function waitForScrollToSettle() {
      window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(() => {
        stopWatching()
        const { top, bottom } = ornament.getBoundingClientRect()
        if (top >= 0 && bottom <= window.innerHeight) setTracedVisit(visits)
      }, 150)
    }

    window.addEventListener('scroll', waitForScrollToSettle, { passive: true })
    waitForScrollToSettle()
    return stopWatching
  }, [visits])

  const tracing = visits > 0 && tracedVisit === visits
  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work-head">
          <h2 id="work-title" className="nav-target journey-heading" tabIndex={-1}>Featured Projects</h2>
          <div ref={ornamentRef} className="work-ornament" aria-hidden="true">
            <svg key={tracedVisit} className={tracing ? 'is-tracing' : undefined} viewBox="0 0 48 44">
              <path className="work-crescent" d={crescentArc} pathLength="1" />
              <path className="work-crescent-inner" d="M27 4C18 11 17 24 25 30C30 34 36 34 41 32" />
              {tracing && (
                <circle className="work-crescent-spark" r="2.2" style={{ offsetPath: 'path("' + crescentArc + '")' }} />
              )}
            </svg>
          </div>
        </div>
        <div className="work-grid">
          {projects.map((project) => {
            const Preview = previews[project.id]
            const titleId = `project-${project.id}-title`
            return (
              <article key={project.id} className="work-card" aria-labelledby={titleId}>
                <Preview />
                <div className="work-card-copy">
                  <p className="work-feature-tags">{project.tags}</p>
                  <h3 id={titleId}>{project.name}</h3>
                  <p className="work-summary">{project.summary}</p>
                  <button
                    className="btn btn-line journey-button"
                    type="button"
                    aria-haspopup="dialog"
                    aria-describedby={titleId}
                    onClick={(event) => onOpen(project, event)}
                  >
                    Explore the project
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
