"use client";
import { useLocation, useParams, matchPath } from 'react-router-dom';
import { useProduct } from '../context/ProductContext';
import { ARTICLES } from '../data/articles';
import Breadcrumbs from './Breadcrumbs';

// One breadcrumb strip for the whole site — every page shows where you
// are and every earlier step is a way back. Hidden on the homepage (it
// has the hero), auth pages, the distraction-free checkout, and admin.
const HIDDEN = ['/', '/login', '/auth/callback', '/payment', '/order-confirmation', '/admin'];

const CATEGORY_LABELS = {
    dehydrated: 'Dehydrated Fruits',
    jams: 'Fruit Jams',
    chutneys: 'Fruit Chutneys'
};

export default function SiteBreadcrumbs() {
    const location = useLocation();
    const { getProductById } = useProduct();
    const path = location.pathname;

    if (HIDDEN.includes(path)) return null;

    const home = { label: 'Home', to: '/' };
    let trail = null;

    let m;
    if (path === '/search') {
        trail = [home, { label: 'Shop' }];
    } else if ((m = matchPath('/product/:id', path))) {
        const product = getProductById(m.params.id);
        trail = [home, { label: 'Shop', to: '/search' }, { label: product?.name || 'Product' }];
    } else if ((m = matchPath('/shop/:category', path))) {
        trail = [home, { label: 'Shop', to: '/search' }, { label: CATEGORY_LABELS[m.params.category] || 'Category' }];
    } else if (path === '/cart') {
        trail = [home, { label: 'Your Basket' }];
    } else if (path === '/recipes') {
        trail = [home, { label: 'The Kitchen' }];
    } else if ((m = matchPath('/recipes/:id', path))) {
        trail = [home, { label: 'The Kitchen', to: '/recipes' }, { label: 'Recipe' }];
    } else if (path === '/health-benefits') {
        trail = [home, { label: 'Health Benefits' }];
    } else if (path === '/adopt-a-tree') {
        trail = [home, { label: 'Adopt a Tree' }];
    } else if (path === '/farm-fresh') {
        trail = [home, { label: 'Farm Fresh' }];
    } else if (path === '/coming-soon') {
        trail = [home, { label: 'Coming Soon' }];
    } else if (path === '/information-centre') {
        trail = [home, { label: 'Information Centre' }];
    } else if ((m = matchPath('/information-centre/:slug', path))) {
        const article = ARTICLES.find(a => a.slug === m.params.slug);
        trail = [home, { label: 'Information Centre', to: '/information-centre' }, { label: article ? article.category : 'Article' }];
    } else if (path === '/legal') {
        trail = [home, { label: 'Legal Policies' }];
    } else if (path === '/profile') {
        trail = [home, { label: 'Profile' }];
    } else if (path === '/orders') {
        trail = [home, { label: 'My Orders' }];
    } else if ((m = matchPath('/orders/:orderId', path))) {
        trail = [home, { label: 'My Orders', to: '/orders' }, { label: `Order #${String(m.params.orderId).slice(0, 8).toUpperCase()}` }];
    }

    if (!trail) return null;

    return (
        <div style={{
            background: 'var(--cream, #F7F4EC)',
            padding: '14px 6vw 2px',
            position: 'relative',
            zIndex: 5
        }}>
            <Breadcrumbs trail={trail} />
        </div>
    );
}
