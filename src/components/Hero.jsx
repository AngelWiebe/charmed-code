import { useLanguage } from '../language'
export default function Hero({ onContact, onNavigate }) {
  const { t } = useLanguage()
  function follow(event) {
    event.preventDefault()
    onNavigate(event.currentTarget.hash.slice(1), { focus: true })
  }

  return (
    <section className="hero" id="top" aria-labelledby="top-title">
      <div className="wrap hero-inner">
        <h1 id="top-title" className="nav-target" tabIndex={-1}>
          {t("Thoughtfully crafted software.")}
          <br /><span>{t("A touch of magic.")}</span>
        </h1>
        <p className="hero-copy">
          {t("Custom web applications, mobile apps, and digital solutions built with care, clarity, and a hint of enchantment.")}
        </p>
        <div className="hero-actions">
          <a className="btn btn-gold" href="#work" onClick={follow}>{t("View Projects")}</a>
          <button className="btn btn-line" type="button" aria-haspopup="dialog" onClick={onContact}>
            {t("Get in Touch")}
          </button>
        </div>
      </div>
    </section>
  )
}
