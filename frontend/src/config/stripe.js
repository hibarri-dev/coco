/**
 * Stripe Payment Links per server package.
 * Create a Payment Link for each package in the Stripe dashboard and set it in `.env`:
 *   VITE_STRIPE_LINK_CORE_32=https://buy.stripe.com/...
 */
const env = import.meta.env;

export const STRIPE_LINKS = {
  'core-32': env.VITE_STRIPE_LINK_CORE_32 || '',
  'core-64': env.VITE_STRIPE_LINK_CORE_64 || '',
  'core-192': env.VITE_STRIPE_LINK_CORE_192 || '',
  'gpu-4x': env.VITE_STRIPE_LINK_GPU_4X || '',
};

export function getCheckoutUrl(packageId, { quantity = 1, email, reference } = {}) {
  const base = STRIPE_LINKS[packageId];
  if (!base) return null;
  const url = new URL(base);
  // Payment Links only honour quantity when "adjustable quantity" is enabled on the link.
  if (quantity > 1) url.searchParams.set('quantity', String(quantity));
  if (email) url.searchParams.set('prefilled_email', email);
  if (reference) url.searchParams.set('client_reference_id', reference);
  return url.toString();
}
