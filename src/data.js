import glyph1 from './assets/journey-glyph-1.webp'
import glyph2 from './assets/journey-glyph-2.webp'
import glyph3 from './assets/journey-glyph-3.webp'
import glyph4 from './assets/journey-glyph-4.webp'
import glyph5 from './assets/journey-glyph-5.webp'
import wordmark1 from './assets/journey-wordmark-1.webp'
import wordmark2 from './assets/journey-wordmark-2.webp'
import wordmark3 from './assets/journey-wordmark-3.webp'
import wordmark4 from './assets/journey-wordmark-4.webp'

export const navigationLinks = [
  { id: 'top', label: 'Home' },
  { id: 'services', label: 'Services' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Projects' },
  { id: 'kind-words', label: 'Kind Words' },
]

export const services = [
  { title: 'Custom Development', icon: glyph1 },
  { title: 'Websites & Web Apps', icon: glyph2 },
  { title: 'Mobile App Development', icon: glyph3 },
  { title: 'Shopify & E-commerce Integrations', icon: glyph4 },
  { title: 'Consulting & Support', icon: glyph5 },
]

export const experience = [
  { name: 'Staples', logo: wordmark1, detail: 'E-commerce platform development and integrations.' },
  { name: 'Intuit Mailchimp', logo: wordmark2, detail: 'Software development for a leading marketing platform.' },
  { name: 'Topstep', logo: wordmark3, detail: 'Mobile app development, real-time trading data, and notifications.' },
  { name: 'Shopify', logo: wordmark4, detail: 'Five years of Shopify integrations and e-commerce solutions.' },
]

export const projects = [
  {
    id: 'true-depth',
    name: 'True Depth Capital',
    tags: 'Web Design, Development',
    url: 'https://truedepthcapital.ca/',
    summary:
      'A vehicle sourcing site for licensed U.S. dealers, with an illustrated scroll journey and a dedicated form for vehicle and wholesale enquiries.',
  },
  {
    id: 'dlr',
    name: 'DLR Consulting Ltd.',
    tags: 'Web Design, Development',
    url: 'https://dlrconsulting.ca/',
    summary:
      'A negotiation practice needed a site as direct as the work. We built a dark, quiet page that leads with the outcome, then the services.',
  },
]

export const testimonials = [
  {
    quote:
      'They were professional, creative, and an absolute joy to work with.',
    name: 'Sarah M., Founder of Willow & Pine',
  },
  {
    quote:
      'They understood the feeling we wanted before we had the words for it. The site is calm, clear, and something our clients actually enjoy using.',
    name: 'Jordan A., Summit Wellbeing',
  },
  {
    quote:
      'From the first conversation to launch, the process felt considered. Our shop looks as warm as the bakery, and it works beautifully.',
    name: 'Elena V., The Golden Whisk',
  },
]
