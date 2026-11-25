import { LanguageProvider, useLanguage } from './language'
import { useCallback, useRef, useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import { CastleValley, Experience, useCastleMotion } from './components/CastleJourney'
import Approach from './components/Approach'
import Work from './components/Work'
import Testimonials from './components/Testimonials'
import Cta from './components/Cta'
import { ContactModal, PrivacyModal, ProjectModal, StoryModal } from './components/Modals'

function Site() {
  const { locale, t } = useLanguage()
  const [contactOpen, setContactOpen] = useState(false)
  const [storyOpen, setStoryOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [project, setProject] = useState(null)
  const [workVisits, setWorkVisits] = useState(0)
  const mainRef = useRef(null)
  useCastleMotion(mainRef, locale)
  const restoreRef = useRef(null)
  const modalOpen = contactOpen || storyOpen || privacyOpen || Boolean(project)

  const openContact = useCallback((event, returnFocus = event.currentTarget) => {
    restoreRef.current = returnFocus
    setContactOpen(true)
  }, [])
  const openStory = useCallback((event) => {
    restoreRef.current = event.currentTarget
    setStoryOpen(true)
  }, [])
  const openPrivacy = useCallback((event) => {
    restoreRef.current = event.currentTarget
    setPrivacyOpen(true)
  }, [])
  const openProject = useCallback((nextProject, event) => {
    restoreRef.current = event.currentTarget
    setProject(nextProject)
  }, [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const closeStory = useCallback(() => setStoryOpen(false), [])
  const closePrivacy = useCallback(() => setPrivacyOpen(false), [])
  const closeProject = useCallback(() => setProject(null), [])

  const navigate = useCallback((target, { focus = false } = {}) => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    if (target === 'work') setWorkVisits((visits) => visits + 1)
    if (target === 'top') {
      window.scrollTo({ top: 0, behavior })
    } else {
      const section = document.getElementById(target)
      const anchor = section?.querySelector('.nav-target') ?? section
      if (anchor) {
        const offset = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-scroll-offset'),
        ) || 94
        const extraClearance = target === 'experience' ? 17 : 0
        const top = anchor.getBoundingClientRect().top + window.scrollY - offset - extraClearance
        window.scrollTo({ top: Math.max(0, top), behavior })
      }
    }
    if (focus) document.getElementById(`${target}-title`)?.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <a
        className="skip-link"
        href="#top-title"
        inert={modalOpen || undefined}
        onClick={(event) => { event.preventDefault(); navigate('top', { focus: true }) }}
      >
        {t("Skip to main content")}
      </a>
      <Header inert={modalOpen || undefined} onNavigate={navigate} onContact={openContact} />
      <main ref={mainRef} id="main" inert={modalOpen || undefined}>
        <Hero onContact={openContact} onNavigate={navigate} />
        <CastleValley>
          <Services />
          <Approach onStory={openStory} />
          <Experience />
          <Work onOpen={openProject} visits={workVisits} />
          <Testimonials />
        </CastleValley>
      </main>
      <Cta inert={modalOpen || undefined} onNavigate={navigate} onContact={openContact} onPrivacy={openPrivacy} />
      {contactOpen && <ContactModal onClose={closeContact} restoreRef={restoreRef} />}
      {storyOpen && <StoryModal onClose={closeStory} restoreRef={restoreRef} />}
      {privacyOpen && <PrivacyModal onClose={closePrivacy} restoreRef={restoreRef} />}
      {project && <ProjectModal project={project} onClose={closeProject} restoreRef={restoreRef} />}
    </>
  )
}

export default function App({ locale = 'en' }) {
  return <LanguageProvider locale={locale}><Site /></LanguageProvider>
}
