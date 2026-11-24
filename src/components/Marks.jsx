import trueDepthPreview from '../assets/true-depth-preview.webp'
import dlrLogo from '../assets/dlr-logo.webp'
import dlrHandshake from '../assets/dlr-handshake.webp'

export function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0l1.6 8.8L22 12l-8.4 3.2L12 24l-1.6-8.8L2 12l8.4-3.2z"
      />
    </svg>
  )
}

function MockBar({ dark = false, links }) {
  return (
    <div className={dark ? 'mock-bar is-dark' : 'mock-bar'}>
      <span className="mock-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {links.map((link) => (
        <span key={link}>{link}</span>
      ))}
    </div>
  )
}

function TrueDepthPreview() {
  return (
    <div className="mock mock-true-depth" aria-hidden="true">
      <img src={trueDepthPreview} alt="" loading="lazy" />
    </div>
  )
}

export function DlrPreview() {
  return (
    <div className="mock mock-dlr" aria-hidden="true">
      <div className="dlr-bar">
        <img className="dlr-logo" src={dlrLogo} loading="lazy" alt="" />
        <span className="is-current">Home</span>
        <span>Services</span>
        <span>Who We Work With</span>
        <span>Payment Terms</span>
        <span className="dlr-pill">Get in Touch</span>
      </div>
      <div className="dlr-hero">
        <div className="dlr-copy">
          <p className="dlr-kicker">Professional negotiation solutions</p>
          <strong>
            <span>Find a Better</span>
            <span className="is-accent">Outcome</span>
            <span>Together</span>
          </strong>
          <p className="dlr-body">Professional negotiation support for individuals and businesses.</p>
        </div>
        <div className="dlr-photo">
          <img src={dlrHandshake} loading="lazy" alt="" />
        </div>
      </div>
    </div>
  )
}

export const previews = {
  'true-depth': TrueDepthPreview,
  dlr: DlrPreview,
}
