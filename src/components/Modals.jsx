import { useLanguage } from '../language'
import { useEffect, useId, useRef, useState } from 'react'
import { previews } from './Marks'

function focusable(node) {
  if (!node) return []
  return [...node.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.getClientRects().length > 0)
}

let scrollLocks = 0
let lockedScrollY = 0
let savedScrollStyles = null

function lockPageScroll() {
  const root = document.documentElement
  const { body } = document
  if (scrollLocks === 0) {
    lockedScrollY = window.scrollY
    const gutter = Math.max(0, window.innerWidth - root.clientWidth)
    savedScrollStyles = {
      overflow: root.style.overflow,
      scrollBehavior: root.style.scrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    }
    root.style.setProperty('--scroll-lock-gutter', `${gutter}px`)
    root.classList.add('is-scroll-locked')
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
  }
  scrollLocks += 1
  return () => {
    scrollLocks = Math.max(0, scrollLocks - 1)
    if (scrollLocks > 0 || !savedScrollStyles) return
    const previous = savedScrollStyles
    savedScrollStyles = null
    root.classList.remove('is-scroll-locked')
    root.style.removeProperty('--scroll-lock-gutter')
    root.style.overflow = previous.overflow
    body.style.overflow = previous.bodyOverflow
    body.style.position = previous.bodyPosition
    body.style.top = previous.bodyTop
    body.style.left = previous.bodyLeft
    body.style.right = previous.bodyRight
    body.style.width = previous.bodyWidth
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, lockedScrollY)
    root.style.scrollBehavior = previous.scrollBehavior
  }
}

function syncVisualViewport() {
  const viewport = window.visualViewport
  if (!viewport) return
  const root = document.documentElement
  root.style.setProperty('--vv-top', `${viewport.offsetTop}px`)
  root.style.setProperty('--vv-height', `${viewport.height}px`)
}

let viewportLocks = 0

function bindVisualViewport() {
  const viewport = window.visualViewport
  if (viewportLocks === 0) {
    syncVisualViewport()
    viewport?.addEventListener('resize', syncVisualViewport)
    viewport?.addEventListener('scroll', syncVisualViewport)
  }
  viewportLocks += 1
  return () => {
    viewportLocks = Math.max(0, viewportLocks - 1)
    if (viewportLocks > 0) return
    viewport?.removeEventListener('resize', syncVisualViewport)
    viewport?.removeEventListener('scroll', syncVisualViewport)
    const root = document.documentElement
    root.style.removeProperty('--vv-top')
    root.style.removeProperty('--vv-height')
  }
}

function useModal(onClose, restoreRef) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const unlockScroll = lockPageScroll()
    const unbindViewport = bindVisualViewport()
    const previouslyFocused = restoreRef?.current instanceof HTMLElement
      ? restoreRef.current
      : document.activeElement
    const node = dialogRef.current
    const preferred = node?.querySelector('[data-autofocus]')
    if (preferred) preferred.focus()
    else node?.focus()

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !node) return
      const current = focusable(node)
      if (!current.length) {
        event.preventDefault()
        node.focus()
        return
      }
      const index = current.indexOf(document.activeElement)
      const nextIndex = event.shiftKey
        ? (index <= 0 ? current.length - 1 : index - 1)
        : (index + 1) % current.length
      event.preventDefault()
      current[nextIndex].focus()
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      unbindViewport()
      unlockScroll()
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onClose, restoreRef])

  return dialogRef
}

function Shell({ title, kicker, onClose, restoreRef, children, wide = false, document = false }) {
  const { t } = useLanguage()
  const dialogRef = useModal(onClose, restoreRef)
  const titleId = useId()
  const className = ['modal', wide && 'is-wide', document && 'is-document'].filter(Boolean).join(' ')
  const body = (
    <>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 id={titleId}>{title}</h2>
      {children}
    </>
  )

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label={t("Close dialog")}>
          <span aria-hidden="true">×</span>
        </button>
        {document ? <div className="modal-scroll">{body}</div> : body}
      </div>
    </div>
  )
}

export function ContactModal({ onClose, restoreRef }) {
  const { t } = useLanguage()
  const [values, setValues] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submittingRef = useRef(false)
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const messageRef = useRef(null)
  const statusRef = useRef(null)
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const nameErrorId = useId()
  const emailErrorId = useId()
  const messageErrorId = useId()
  const messageHintId = useId()

  useEffect(() => {
    if (sent) statusRef.current?.focus()
  }, [sent])

  function update(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (submittingRef.current) return
    setSubmitError('')
    const next = {}
    if (!values.name.trim()) next.name = t("Please enter your name.")
    if (!values.email.trim()) {
      next.email = t("Please enter your email.")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = t("Please enter a valid email.")
    }
    if (!values.message.trim()) {
      next.message = t("Please enter a project description.")
    } else if (values.message.trim().length < 10) {
      next.message = t("Please write at least 10 characters about your project.")
    }
    setErrors(next)
    if (next.name) nameRef.current?.focus()
    else if (next.email) emailRef.current?.focus()
    else if (next.message) messageRef.current?.focus()
    if (Object.keys(next).length) return

    const form = event.currentTarget
    const body = new FormData(form)
    submittingRef.current = true
    setSubmitting(true)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15_000)
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
        signal: controller.signal,
      })

      if (response.ok) setSent(true)
      else if (response.status === 429) setSubmitError(t("Too many attempts. Please wait a minute and try again."))
      else setSubmitError(t("Your message could not be sent. Please try again."))
    } catch {
      setSubmitError(
        controller.signal.aborted
          ? t("Sending timed out. We couldn’t confirm delivery. Your message is still here if you want to try again.")
          : t("Your message could not be sent. Please try again."),
      )
    } finally {
      window.clearTimeout(timeout)
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <Shell title={sent ? t("Message received.") : t("Tell us about your idea.")} kicker={t("Get in touch")} onClose={onClose} restoreRef={restoreRef}>
      {sent ? (
        <div ref={statusRef} className="thanks" role="status" tabIndex={-1}>
          <p>
            {t('Thank you, {name}. We read every note, and we’ll write back about what you’re building.', {
              name: values.name.trim().split(/\s+/)[0],
            })}
          </p>
          <button className="btn btn-gold" type="button" onClick={onClose}>
            {t("Close")}
          </button>
        </div>
      ) : (
        <form className="contact-form" action="https://formspree.io/f/xppdrney" method="post" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor={nameId}>{t("Name")} <span aria-hidden="true">{t("(required)")}</span></label>
            <input
              ref={nameRef}
              id={nameId}
              name="name"
              value={values.name}
              onChange={update}
              autoComplete="name"
              required
              aria-invalid={errors.name ? 'true' : undefined}
              aria-describedby={errors.name ? nameErrorId : undefined}
              data-autofocus
            />
            {errors.name && <p id={nameErrorId} className="field-error" role="alert">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor={emailId}>{t("Email")} <span aria-hidden="true">{t("(required)")}</span></label>
            <input
              ref={emailRef}
              id={emailId}
              name="email"
              type="email"
              value={values.email}
              onChange={update}
              autoComplete="email"
              required
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? emailErrorId : undefined}
            />
            {errors.email && <p id={emailErrorId} className="field-error" role="alert">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor={messageId}>{t("Project description")} <span aria-hidden="true">{t("(required)")}</span></label>
            <p id={messageHintId} className="field-hint">{t("At least 10 characters.")}</p>
            <textarea
              ref={messageRef}
              id={messageId}
              name="message"
              rows="5"
              minLength={10}
              value={values.message}
              onChange={update}
              required
              aria-invalid={errors.message ? 'true' : undefined}
              aria-describedby={errors.message ? `${messageHintId} ${messageErrorId}` : messageHintId}
            />
            {errors.message && (
              <p id={messageErrorId} className="field-error" role="alert">{errors.message}</p>
            )}
          </div>
          {submitError && <p className="field-error" role="alert">{submitError}</p>}
          <button className="btn btn-gold" type="submit" disabled={submitting}>
            {submitting ? t("Sending…") : t("Send message")} <span aria-hidden="true">→</span>
          </button>
        </form>
      )}
    </Shell>
  )
}

export function StoryModal({ onClose, restoreRef }) {
  const { t } = useLanguage()
  return (
    <Shell title={t("A studio for imaginative work.")} kicker={t("Our story")} onClose={onClose} restoreRef={restoreRef}>
      <div className="story">
        <p>
          {t("Charmed Code started with a simple belief: a website should feel like the brand it represents. Not a template with the colors swapped, and not a spectacle that forgets the person trying to find their way.")}
        </p>
        <p>
          {t("We partner with small businesses and thoughtful teams. Strategy, design, and code stay in one conversation, from the first spark through launch and the quiet improvements that come after. That is the magic we mean — care, craft, and a little wonder.")}
        </p>
      </div>
    </Shell>
  )
}

export function PrivacyModal({ onClose, restoreRef }) {
  const { t } = useLanguage()
  return (
    <Shell title={t("Privacy Policy")} kicker={t("Legal")} onClose={onClose} restoreRef={restoreRef} document>
      <div className="policy">
        <p className="policy-date">{t("Effective November 5, 2026")}</p>

        <section>
          <h3>{t("1. Introduction")}</h3>
          <p>
            {t("Welcome to Charmed Code, a brand operated by 2734539 Alberta Ltd., based in Alberta, Canada.")}
          </p>
          <p>
            {t("We respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy explains how we collect, use, disclose, and protect information when you visit our website or contact us.")}
          </p>
        </section>

        <section>
          <h3>{t("2. Information We Collect")}</h3>
          <p>
            {t("Our website does not require visitors to create accounts or provide personal information to browse its content.")}
          </p>
          <p>
            {t("We may collect personal information when you contact us by email or submit our contact form, including:")}
          </p>
          <ul>
            <li>{t("Your name and email address")}</li>
            <li>{t("Your company or organization name, if provided")}</li>
            <li>{t("Information about your project or inquiry")}</li>
            <li>{t("Any additional information you choose to share")}</li>
          </ul>
          <p>
            {t("We use Formspree to process contact form submissions. When you submit the form, your name, email address, and message are sent to Formspree so we can receive and respond to your inquiry.")}
          </p>
          <p>
            {t("Our website is hosted using GitHub Pages. GitHub may automatically process technical information, such as IP addresses and browser information, to operate, maintain, and secure its hosting services.")}
          </p>
        </section>

        <section>
          <h3>{t("3. How We Use Your Information")}</h3>
          <p>{t("We use information you voluntarily provide to:")}</p>
          <ul>
            <li>{t("Respond to questions and inquiries")}</li>
            <li>{t("Discuss potential projects and services")}</li>
            <li>{t("Prepare proposals and estimates")}</li>
            <li>{t("Communicate about ongoing business relationships")}</li>
            <li>{t("Meet applicable legal and regulatory obligations")}</li>
          </ul>
          <p>{t("We do not sell your personal information.")}</p>
        </section>

        <section>
          <h3>{t("4. Cookies and Tracking Technologies")}</h3>
          <p>
            {t("Charmed Code does not intentionally use advertising cookies, analytics trackers, or third-party marketing tools.")}
          </p>
          <p>
            {t("Our hosting provider or other third-party services may process technical information necessary to deliver and secure the website.")}
          </p>
          <p>
            {t("If we introduce analytics, cookies, or other tracking technologies in the future, we will update this Privacy Policy accordingly.")}
          </p>
        </section>

        <section>
          <h3>{t("5. Information Sharing")}</h3>
          <p>{t("We do not sell, rent, or trade your personal information.")}</p>
          <p>
            {t("We may share information with service providers where reasonably necessary to operate our business, or where disclosure is required or permitted by law.")}
          </p>
          <p>{t("Some service providers may process or store information outside Alberta or Canada.")}</p>
        </section>

        <section>
          <h3>{t("6. Data Security")}</h3>
          <p>
            {t("We take reasonable measures to protect personal information against unauthorized access, disclosure, alteration, or loss.")}
          </p>
          <p>{t("However, no method of electronic communication or storage is completely secure.")}</p>
        </section>

        <section>
          <h3>{t("7. Data Retention")}</h3>
          <p>
            {t("We retain personal information only as long as reasonably necessary for the purposes described in this policy, including fulfilling business obligations and complying with applicable legal requirements.")}
          </p>
          <p>
            {t("When information is no longer required, we take reasonable steps to securely delete or anonymize it.")}
          </p>
        </section>

        <section>
          <h3>{t("8. Your Privacy Rights")}</h3>
          <p>
            {t("Subject to applicable laws, you may request access to personal information we hold about you or ask us to correct inaccurate information.")}
          </p>
          <p>{t("You may also contact us with questions or concerns about how your information is handled.")}</p>
          <p>{t("We will respond to privacy requests in accordance with applicable privacy legislation.")}</p>
        </section>

        <section>
          <h3>{t("9. Third-Party Websites")}</h3>
          <p>
            {t("Our website may contain links to external websites, including project demonstrations, GitHub repositories, or other third-party services.")}
          </p>
          <p>
            {t("We are not responsible for the privacy practices or content of those websites. We encourage visitors to review their respective privacy policies.")}
          </p>
        </section>

        <section>
          <h3>{t("10. Children’s Privacy")}</h3>
          <p>
            {t("Our website is intended for general business and professional audiences. We do not knowingly solicit personal information from children.")}
          </p>
        </section>

        <section>
          <h3>{t("11. Changes to This Policy")}</h3>
          <p>
            {t("We may update this Privacy Policy periodically to reflect changes to our website, business practices, or legal obligations.")}
          </p>
          <p>{t("Any updates will be published on this page with a revised effective date.")}</p>
        </section>

        <section>
          <h3>{t("12. Contact Us")}</h3>
          <p>
            {t("For questions, concerns, or requests regarding this Privacy Policy, please contact:")}
          </p>
          <p className="policy-contact">
            <strong>Charmed Code</strong>
            <br />
            {t("Operated by 2734539 Alberta Ltd.")}
            <br />
            Alberta, Canada
          </p>
          <p>
            <strong>{t("Email:")}</strong>{' '}
            <a href="mailto:info@charmedcode.ca">info@charmedcode.ca</a>
          </p>
        </section>
      </div>
    </Shell>
  )
}

export function ProjectModal({ project, onClose, restoreRef }) {
  const { t } = useLanguage()
  const Preview = previews[project.id]
  return (
    <Shell title={project.name} kicker={t("Featured work")} onClose={onClose} restoreRef={restoreRef} wide>
      <div className="project-modal">
        <Preview />
        <p className="project-tags">{t(project.tags)}</p>
        <p>{t(project.summary)}</p>
        {project.url && (
          <p>
            <a className="project-link" href={project.url} target="_blank" rel="noreferrer">
              {t("Visit the site")}
            </a>
          </p>
        )}
      </div>
    </Shell>
  )
}
