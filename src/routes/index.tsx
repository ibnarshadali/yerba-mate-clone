import { createFileRoute, Link, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Site, ProductGrid } from '@/components/manaya/Site';
import { Animation } from '@/components/manaya/Animation';
import { products } from '@/data/products';
import { assets } from '@/data/assets';
const CanScene = lazy(() => import('@/components/manaya/CanScene'));
export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'MANA Yerba Maté — Infused with bio energy' }, { name: 'description', content: 'Fresh, fruity, sparkling organic yerba mate. Discover MANA’s naturally caffeinated flavors.' }, { property: 'og:title', content: 'MANA Yerba Maté' }, { property: 'og:description', content: 'Infused with bio energy. Discover our sparkling organic yerba mate.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});
const flavorKeys = ['melon', 'grapefruit', 'blackberry', 'tropical'];
const benefits = [['WITHOUT THE CRASH', 'A gentle wave of energy. To get you going without the crash.'], ['NATURAL CAFFEINE', 'This certified organic caffeine comes from the plant. A gift from Mother Nature.'], ['ANTIOXIDANT', 'Richer in antioxidants than tea. Not bad.'], ['VEGAN', 'A plant-based drink that tastes like heaven. Who could ask for more?']];
function Index() {
  const [flavor, setFlavor] = useState(0);
  const key = flavorKeys[flavor] ?? 'melon';
  const current = products[flavor];
  if (!current) return null;
  const change = (delta: number) => setFlavor((flavor + delta + 4) % 4);
  return <Site className={`home flavor-${key}`}><main>
    <section className="drink-hero" aria-label="MANA Yerba Maté">
      <h1 className="sr-only">MANA — Infused with bio energy</h1>
      <div className="hero-art" key={key}>
        {[1, 2, 3].map(n => assets[`${key}-${n}.json`] && <Animation key={n} url={assets[`${key}-${n}.json`]} className={`hero-illustration illustration-${n}`} />)}
        {flavor === 0 && <img className="flower-art" src={assets['flower.svg']} alt="" />}
        {flavor === 1 && <img className="woman-art" src={assets['woman.svg']} alt="" />}
        {flavor === 2 && <img className="planet-art" src={assets['planet.svg']} alt="" />}
        {flavor === 3 && <img className="mango-art" src={assets['mango.svg']} alt="" />}
      </div>
      <ClientOnly><Suspense fallback={<div className="can-scene" />}><CanScene flavor={flavor} /></Suspense></ClientOnly>
      <div className="hero-controls"><Button className="nav-pill round" onClick={() => change(-1)} aria-label="Previous flavor"><ArrowLeft /></Button><Button className="flavor-button" asChild><Link to="/products/$handle" params={{ handle: current.handle }}>{current.title}</Link></Button><Button className="nav-pill round" onClick={() => change(1)} aria-label="Next flavor"><ArrowRight /></Button></div>
    </section>
    <section className="intro-section"><h2>MANA ? YERBA MATÉ ?<br />WHAT ARE WE TALKING ABOUT?</h2><p>(we're going to tell each other the real things)</p><div className="benefits">{benefits.map(([title, text], i) => <article key={title}><Animation url={assets[`benefit-${i + 1}.json`]} className="benefit-art" /><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="flavors-section"><h2>FLAVORS</h2><p>FRESH, FRUITY, SPARKLING, BEAUTIFUL COLOURS,<br />AWAKEN YOUR TASTE BUDS.</p><div className="flavor-photos"><img src={assets['left.jpg']} alt="MANA sparkling yerba mate flavors" loading="lazy" /><img src={assets['right.jpg']} alt="Fresh fruity MANA drinks" loading="lazy" /></div></section>
    <section className="recommended"><div className="section-heading"><h2>Recommended products</h2><Button asChild className="outline-pill"><Link to="/collections/all">See all our products <ArrowUpRight /></Link></Button></div><ProductGrid /></section>
    <section className="subscription-section"><div><p>Sign up for automatic delivery* and save 10%.</p><Button asChild className="outline-pill"><Link to="/pages/$slug" params={{ slug: 'abonnement' }}>Subscribe <ArrowUpRight /></Link></Button></div><h2>WE HAVE<br />WHAT<br />YOU NEED</h2><small>* We don't deliver in space yet, but who knows...</small></section>
    <section className="social-section"><a href="https://www.instagram.com/manayerbamate/">@MANAYERBAMATE <ArrowUpRight /></a><p>FOR A DOSE OF ENERGY IN YOUR FEED.</p><div className="social-photos"><img src={assets['left.jpg']} alt="MANA in your daily life" loading="lazy" /><img src={assets['right.jpg']} alt="A fresh dose of MANA energy" loading="lazy" /></div></section>
  </main></Site>;
}
