import { createFileRoute, notFound } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { Site, ProductGrid } from '@/components/manaya/Site';
import { Button } from '@/components/ui/button';
import { pages } from '@/data/pages';
import { assets } from '@/data/assets';
export const Route = createFileRoute('/pages/$slug')({
  loader: ({ params }) => { const page = pages[params.slug]; if (!page) throw notFound(); return { page, slug: params.slug }; },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.page.title ?? 'Learn'} — MANA Yerba Maté` }, { name: 'description', content: `${loaderData?.page.title ?? 'Learn more'} at MANA organic sparkling yerba mate.` }, { property: 'og:title', content: `${loaderData?.page.title ?? 'Learn'} — MANA` }, { property: 'og:description', content: 'Discover MANA organic sparkling yerba mate.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: Page,
});
function Page() {
  const { page, slug } = Route.useLoaderData();
  return <Site className={`inner-page info-${slug}`}><main className="information-page"><h1>{page.title}</h1>
    {slug === 'faq' ? <div className="faq-list">{page.blocks.map(b => <details key={b.heading}><summary>{b.heading}<span>+</span></summary><p>{b.text}</p></details>)}</div> : <div className="information-content">{page.blocks.filter(b => b.text).map((b, i) => <section key={i}>{i > 0 && <h2>{b.heading}</h2>}<p>{b.text}</p></section>)}</div>}
    {slug === 'abonnement' && <ProductGrid />}
    {slug === 'contactez-nous' && <div className="contact-panel"><h2>LET'S TALK.</h2><Button asChild className="outline-pill"><a href="https://en.manayerbamate.com/pages/contactez-nous">Contact MANA <ArrowUpRight /></a></Button></div>}
    {slug === 'points-de-vente' && <div className="store-locator"><img src={assets['left.jpg']} alt="Find MANA near you" /><Button asChild className="outline-pill"><a href="https://en.manayerbamate.com/pages/points-de-vente">Find a store near you <ArrowUpRight /></a></Button></div>}
  </main></Site>;
}