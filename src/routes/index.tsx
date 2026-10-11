import { createFileRoute, Link, ClientOnly } from '@tanstack/react-router';
import { lazy, Suspense, useRef, useState } from 'react';
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
  const dir = useRef(1);
  const key = flavorKeys[flavor] ?? 'melon';
  const current = products[flavor];
  if (!current) return null;
  const change = (delta: number) => { dir.current = delta; setFlavor((flavor + delta + 4) % 4); };
  const leftArt = (n: number) => n === 1 || (n === 2 && key === 'blackberry');
  const art = (left: boolean) => <>
    {[1, 2, 3].filter(n => leftArt(n) === left).map(n => assets[`${key}-${n}.json`] && <Animation key={n} url={assets[`${key}-${n}.json`]} className={`hero-illustration illustration-${n}`} />)}
    {left && flavor === 0 && <img className="flower-art" src={assets['flower.svg']} alt="" />}
    {!left && flavor === 1 && <img className="woman-art" src={assets['woman.svg']} alt="" />}
    {!left && flavor === 2 && <img className="planet-art" src={assets['planet.svg']} alt="" />}
    {!left && flavor === 3 && <img className="mango-art" src={assets['mango.svg']} alt="" />}
  </>;
  return <Site className={`home flavor-${key}`}><main>
    <section className="drink-hero" data-can-hero aria-label="MANA Yerba Maté">
      <h1 className="sr-only">MANA — Infused with bio energy</h1>
      <div className="hero-stage">
        <div className={`hero-art swing-${dir.current > 0 ? 'next' : 'prev'}`} key={key}>
          <div className="art-side art-left">{art(true)}</div>
          <div className="art-side art-right">{art(false)}</div>
        </div>
        <div className="hero-controls"><Button className="nav-pill round" onClick={() => change(-1)} aria-label="Previous flavor"><ArrowLeft /></Button><Button className="flavor-button" asChild><Link to="/products/$handle" params={{ handle: current.handle }}>{current.title}</Link></Button><Button className="nav-pill round" onClick={() => change(1)} aria-label="Next flavor"><ArrowRight /></Button></div>
      </div>
      <ClientOnly><Suspense fallback={<div className="can-stage" />}><CanScene flavor={flavor} /></Suspense></ClientOnly>
    </section>
    <section className="benefit-circle" data-can-circle aria-label="Why MANA">
      <div className="circle-pin">
        <div className="circle-arc" aria-hidden="true" />
        <div className="wheel">
          <div className="wheel-card"><div className="wheel-step"><h2>MANA ? YERBA MATÉ ?<br />WHAT ARE WE TALKING ABOUT?</h2><p className="wheel-sub">(we're going to tell each other the real things)</p></div></div>
          {benefits.map(([title, text], i) => <div className="wheel-card" key={title} style={{ transform: `rotate(${(i + 1) * 25}deg)` }}><div className="wheel-step benefit-step"><Animation url={assets[`benefit-${i + 1}.json`]} className="benefit-art" /><h3>{title}</h3><p>{text}</p></div></div>)}
        </div>
      </div>
    </section>
    <section className="flavors-section"><h2>FLAVORS</h2><p>FRESH, FRUITY, SPARKLING, BEAUTIFUL COLOURS,<br />AWAKEN YOUR TASTE BUDS.</p><div className="flavor-photos"><img src={assets['left.jpg']} alt="MANA sparkling yerba mate flavors" loading="lazy" /><img src={assets['right.jpg']} alt="Fresh fruity MANA drinks" loading="lazy" /></div></section>
    <section className="recommended"><div className="section-heading"><h2>Recommended products</h2><Button asChild className="outline-pill"><Link to="/collections/all">See all our products <ArrowUpRight /></Link></Button></div><ProductGrid /></section>
    <section className="subscription-section"><div><p>Sign up for automatic delivery* and save 10%.</p><Button asChild className="outline-pill"><Link to="/pages/$slug" params={{ slug: 'abonnement' }}>Subscribe <ArrowUpRight /></Link></Button></div><h2>WE HAVE<br />WHAT<br />YOU NEED</h2><small>* We don't deliver in space yet, but who knows...</small></section>
    <section className="social-section"><a href="https://www.instagram.com/manayerbamate/">@MANAYERBAMATE <ArrowUpRight /></a><p>FOR A DOSE OF ENERGY IN YOUR FEED.</p><div className="social-photos"><img src={assets['left.jpg']} alt="MANA in your daily life" loading="lazy" /><img src={assets['right.jpg']} alt="A fresh dose of MANA energy" loading="lazy" /></div></section>
  </main></Site>;
}
