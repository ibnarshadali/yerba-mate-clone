import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronDown, ShoppingCart, UserRound, X, Menu, ArrowUpRight, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assets } from '@/data/assets';
import { products, productImages } from '@/data/products';

export function Header() {
  const [banner, setBanner] = useState(true);
  const [menu, setMenu] = useState<string | null>(null);
  return <header className="site-header">
    {banner && <div className="shipping">FREE SHIPPING ON ALL PURCHASES OF $35 OR MORE QUEBEC AND ONTARIO<Button variant="ghost" size="icon" aria-label="Close announcement" onClick={() => setBanner(false)}><X /></Button></div>}
    <div className="nav-row"><Link to="/" aria-label="MANA home"><img className="logo" src={assets['logo.svg']} alt="MANA" /></Link>
      <nav aria-label="Main navigation">
        <Button className="nav-pill" onClick={() => setMenu(menu === 'shop' ? null : 'shop')}>Shop <ChevronDown /></Button>
        <Button className="nav-pill" onClick={() => setMenu(menu === 'learn' ? null : 'learn')}>Learn <ChevronDown /></Button>
        <Button asChild className="nav-pill subscription-link"><Link to="/pages/$slug" params={{ slug: 'abonnement' }}>Subscription</Link></Button>
        <Button asChild className="nav-pill language"><a href="https://manayerbamate.com/" lang="fr">Fr</a></Button>
        <Button asChild className="nav-pill round" aria-label="My account"><a href="https://en.manayerbamate.com/account"><UserRound /></a></Button>
        <Button asChild className="nav-pill round" aria-label="Shopping cart"><a href="https://en.manayerbamate.com/cart"><ShoppingCart /></a></Button>
        <Button className="nav-pill round mobile-menu" aria-label="Open menu" onClick={() => setMenu(menu ? null : 'learn')}><Menu /></Button>
      </nav>
    </div>
    {menu && <div className="mega-menu"><Button variant="ghost" className="menu-close" size="icon" aria-label="Close menu" onClick={() => setMenu(null)}><X /></Button>
      {menu === 'shop' ? <><div className="menu-products">{products.map((p, i) => <Link key={p.handle} to="/products/$handle" params={{ handle: p.handle }} onClick={() => setMenu(null)}><img src={productImages[i]} alt={p.title} /><span>{p.title} <ArrowUpRight size={18} /></span></Link>)}</div><Link to="/collections/all" onClick={() => setMenu(null)}>All our products →</Link></> : <div className="learn-links">{([['points-de-vente', 'Points of sale'], ['yerba-mate', 'Yerba Mate'], ['faq', 'FAQ'], ['contactez-nous', 'Contact'], ['abonnement', 'Subscription']] as const).map(([slug, title]) => <Link key={slug} to="/pages/$slug" params={{ slug }} onClick={() => setMenu(null)}>{title}<ArrowUpRight /></Link>)}</div>}
    </div>}
  </header>;
}
export function Footer() {
  return <footer className="site-footer"><Link to="/" aria-label="MANA home"><img src={assets['logo.svg']} alt="MANA" /></Link><span>2026 © Mana Yerba Maté</span><div><Link to="/pages/$slug" params={{ slug: 'conditions-dutilisation' }}>Terms of use</Link><Link to="/pages/$slug" params={{ slug: 'politique-de-remboursement' }}>Refund policy</Link><a href="https://www.instagram.com/manayerbamate/" aria-label="Instagram"><Instagram size={20} /></a></div></footer>;
}
export function Site({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}><Header />{children}<Footer /></div>;
}
export function ProductGrid() {
  return <div className="product-grid">{products.map((p, i) => <Link className="product-item" key={p.handle} to="/products/$handle" params={{ handle: p.handle }}><div className="product-photo"><img src={productImages[i]} alt={p.title} loading="lazy" /><span className="product-discover">Discover this product <ArrowUpRight /></span></div><div className="product-label"><h3>{p.title}</h3><span>$36.99</span></div></Link>)}</div>;
}