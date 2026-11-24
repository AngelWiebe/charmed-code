import { services } from '../data'
import banner from '../assets/journey-banner.webp'

export default function Services() {
  return (
    <section className="services castle-services" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <h2 id="services-title" className="nav-target journey-heading" tabIndex={-1}>Our Services</h2>
        <ul className="service-banners" aria-label="Development and consulting services">
          {services.map((service) => (
            <li key={service.title} className="service-banner">
              <img className="service-banner-cloth" src={banner} alt="" loading="lazy" />
              <div className="service-banner-copy">
                <img src={service.icon} width="44" height="44" loading="lazy" alt="" />
                <h3>{service.title}</h3>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
