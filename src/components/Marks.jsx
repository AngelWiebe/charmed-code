import trueDepthPreview from '../assets/true-depth-preview.webp'
import dlrLogo from '../assets/dlr-logo.webp'
import dlrHandshake from '../assets/dlr-handshake.webp'

function TrueDepthPreview() {
  return (
    <div className="mock mock-true-depth" aria-hidden="true">
      <img src={trueDepthPreview} alt="" loading="lazy" />
    </div>
  )
}

function DlrPreview() {
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
