import footerBackground from '../assets/footer-background.webp'
import logo from '../assets/logo.webp'
import linkedin from '../assets/footer-linkedin.webp'
import email from '../assets/footer-email.webp'
import moon from '../assets/footer-moon.webp'
import { navigationLinks } from '../data'

const destinations = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/angel-wiebe-a07112113/', icon: linkedin },
  { label: 'Email Charmed Code', href: 'mailto:info@charmedcode.ca', icon: email },
]

export default function Cta({ inert, onNavigate, onContact, onPrivacy }) {
  function follow(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    onNavigate(event.currentTarget.hash.slice(1), { focus: true })
  }

  return (
    <footer className="cta" aria-label="Charmed Code footer" inert={inert}>
      <img className="cta-background" src={footerBackground} alt="" loading="lazy" />
      <div className="cta-inner">
        <div className="footer-main">
          <a className="footer-logo" href="#top" onClick={follow}>
            <img src={logo} alt="Charmed Code, home" loading="lazy" />
          </a>
          <nav className="footer-nav" aria-label="Footer">
            <ul>
              {navigationLinks.map(({ id, label }) => (
                <li key={id}><a href={`#${id}`} onClick={follow}>{label}</a></li>
              ))}
              <li><button type="button" aria-haspopup="dialog" onClick={onContact}>Contact</button></li>
            </ul>
          </nav>
          <ul className="footer-socials" aria-label="Find Charmed Code online">
            {destinations.map(({ label, href, icon }) => (
              <li key={label}>
                <a href={href} aria-label={label}><img src={icon} alt="" width="44" height="44" loading="lazy" /></a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-divider" aria-hidden="true">
          <img src={moon} width="59" height="49" alt="" loading="lazy" />
        </div>
        <ul className="legal" aria-label="Legal">
          <li>© 2026 Charmed Code. All rights reserved.</li>
          <li>A brand of 2734539 Alberta Ltd.</li>
          <li>Alberta, Canada</li>
          <li>
            <button type="button" className="legal-link" aria-haspopup="dialog" onClick={onPrivacy}>
              Privacy Policy
            </button>
          </li>
        </ul>
      </div>
    </footer>
  )
}
