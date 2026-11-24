export default function Hero({ onContact, onNavigate }) {
  function follow(event) {
    event.preventDefault()
    onNavigate(event.currentTarget.hash.slice(1), { focus: true })
  }

  return (
    <section className="hero" id="top" aria-labelledby="top-title">
      <div className="wrap hero-inner">
        <h1 id="top-title" className="nav-target" tabIndex={-1}>
          Thoughtfully crafted software.
          <br /><span>A touch of magic.</span>
        </h1>
        <p className="hero-copy">
          Custom web applications, mobile apps, and digital solutions built with care, clarity,
          and a hint of enchantment.
        </p>
        <div className="hero-actions">
          <a className="btn btn-gold" href="#work" onClick={follow}>View Projects</a>
          <button className="btn btn-line" type="button" aria-haspopup="dialog" onClick={onContact}>
            Get in Touch
          </button>
        </div>
      </div>
    </section>
  )
}
