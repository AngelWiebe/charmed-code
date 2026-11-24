import { useLanguage } from '../language'
import mark1 from '../assets/journey-about-1.webp'
import mark2 from '../assets/journey-about-2.webp'
import mark3 from '../assets/journey-about-3.webp'
import mark4 from '../assets/journey-about-4.webp'

export default function Approach({ onStory }) {
  const { t } = useLanguage()
  return (
    <section className="approach" id="about" aria-labelledby="about-title">
      <div className="wrap approach-grid">
        <div className="approach-copy">
          <h2 id="about-title" className="nav-target journey-heading" tabIndex={-1}>
            {t("About Charmed Code")}
          </h2>
          <p>
            {t("With over 11 years of software development experience, I blend technical expertise with creative problem-solving to build reliable, user-friendly solutions.")}
          </p>
          <dl className="approach-stats">
            <div>
              <dt><img src={mark1} width="33" height="30" alt="" loading="lazy" />{t("Software development")}</dt>
              <dd>{t("11+ years")}</dd>
            </div>
            <div>
              <dt><img src={mark2} width="33" height="30" alt="" loading="lazy" />{t("Shopify integrations")}</dt>
              <dd>{t("5 years")}</dd>
            </div>
            <div>
              <dt><img src={mark3} width="33" height="30" alt="" loading="lazy" />{t("Development")}</dt>
              <dd>{t("Web, mobile & full stack")}</dd>
            </div>
            <div>
              <dt><img src={mark4} width="33" height="30" alt="" loading="lazy" />{t("Teams")}</dt>
              <dd>{t("Enterprise & startups")}</dd>
            </div>
          </dl>
          <button className="btn btn-line journey-button" type="button" aria-haspopup="dialog" onClick={onStory}>
            {t("Learn More About Us")}
          </button>
        </div>
      </div>
    </section>
  )
}
