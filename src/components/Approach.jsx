import mark1 from '../assets/journey-about-1.webp'
import mark2 from '../assets/journey-about-2.webp'
import mark3 from '../assets/journey-about-3.webp'
import mark4 from '../assets/journey-about-4.webp'

export default function Approach({ onStory }) {
  return (
    <section className="approach" id="about" aria-labelledby="about-title">
      <div className="wrap approach-grid">
        <div className="approach-copy">
          <h2 id="about-title" className="nav-target journey-heading" tabIndex={-1}>
            About Charmed Code
          </h2>
          <p>
            With over 11 years of software development experience, I blend technical expertise
            with creative problem-solving to build reliable, user-friendly solutions.
          </p>
          <dl className="approach-stats">
            <div>
              <dt><img src={mark1} width="33" height="30" alt="" loading="lazy" />Software development</dt>
              <dd>11+ years</dd>
            </div>
            <div>
              <dt><img src={mark2} width="33" height="30" alt="" loading="lazy" />Shopify integrations</dt>
              <dd>5 years</dd>
            </div>
            <div>
              <dt><img src={mark3} width="33" height="30" alt="" loading="lazy" />Development</dt>
              <dd>Web, mobile &amp; full stack</dd>
            </div>
            <div>
              <dt><img src={mark4} width="33" height="30" alt="" loading="lazy" />Teams</dt>
              <dd>Enterprise &amp; startups</dd>
            </div>
          </dl>
          <button className="btn btn-line journey-button" type="button" aria-haspopup="dialog" onClick={onStory}>
            Learn More About Us
          </button>
        </div>
      </div>
    </section>
  )
}
