/*
 * What families say, shown on the sales page. The section stays hidden until at
 * least one entry exists. Use first names or initials only, and only with the
 * family's permission. `es` is optional; without it the English quote is shown.
 *
 * Example:
 *   { quote: { en: 'Our kids ask for it every week!', es: '¡Nuestros hijos lo piden cada semana!' }, name: 'The M. family', place: 'Houston, TX' },
 */
export interface Testimonial {
  quote: { en: string; es?: string };
  name: string;
  place?: string;
}

export const TESTIMONIALS: Testimonial[] = [];
