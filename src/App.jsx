import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { ProductProvider } from './context/ProductContext'
import { InventoryProvider } from './context/InventoryContext'
import { AuthProvider } from './context/AuthContext'
import { WishlistProvider } from './context/WishlistContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import BottomNav from './components/BottomNav'
import TopNav from './components/TopNav'
import SiteBreadcrumbs from './components/SiteBreadcrumbs'
import CartToast from './components/CartToast'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AuthCallback from './pages/AuthCallback'
import './App.css'

// A stale tab open across a deploy asks for a lazy chunk's old hashed
// filename, which 404s and falls through the SPA rewrite to index.html —
// the browser then fails to parse HTML as JS. Reload once to pick up the
// new build instead of surfacing that as a crash (worst possible timing
// right after checkout).
const lazyWithReload = (importer) => lazy(() => importer().catch((error) => {
    // Allow another auto-recovery after 30s so a tab that lives across
    // several deploys keeps healing itself, while a genuinely broken
    // build can still only trigger one reload per half-minute (no loop).
    const key = 'chunk-reload-at';
    const last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last > 30000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
        return new Promise(() => {}); // reloading; never resolve
    }
    throw error;
}));

// Route-level code splitting — Home stays eager for instant first paint,
// everything else loads on demand.
const Search = lazyWithReload(() => import('./pages/Search'))
const ProductDetail = lazyWithReload(() => import('./pages/ProductDetail'))
const Cart = lazyWithReload(() => import('./pages/Cart'))
const Payment = lazyWithReload(() => import('./pages/Payment'))
const OrderConfirmation = lazyWithReload(() => import('./pages/OrderConfirmation'))
const Profile = lazyWithReload(() => import('./pages/Profile'))
const HealthBenefits = lazyWithReload(() => import('./pages/HealthBenefits'))
const Recipes = lazyWithReload(() => import('./pages/Recipes'))
const RecipeDetail = lazyWithReload(() => import('./pages/RecipeDetail'))
const Admin = lazyWithReload(() => import('./pages/Admin'))
const Login = lazyWithReload(() => import('./pages/Login'))
const MyOrders = lazyWithReload(() => import('./pages/MyOrders'))
const OrderSummary = lazyWithReload(() => import('./pages/OrderSummary'))
const Legal = lazyWithReload(() => import('./pages/Legal'))
const FarmFresh = lazyWithReload(() => import('./pages/FarmFresh'))
const AdoptATree = lazyWithReload(() => import('./pages/AdoptATree'))
const ComingSoon = lazyWithReload(() => import('./pages/ComingSoon'))
const InformationCentre = lazyWithReload(() => import('./pages/InformationCentre'))
const ArticleDetail = lazyWithReload(() => import('./pages/ArticleDetail'))
const ShopCategory = lazyWithReload(() => import('./pages/ShopCategory'))
const Wishlist = lazyWithReload(() => import('./pages/Wishlist'))

const PageLoader = () => (
    <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Fraunces', Georgia, serif",
        fontStyle: 'italic',
        fontSize: '1.15rem',
        color: '#83866F'
    }}>
        Gathering&hellip;
    </div>
)

// Soft cross-page fade. Opacity only — transforms here would break
// position:fixed bars and GSAP scroll pinning inside pages.
const RouteFade = ({ children }) => {
    const location = useLocation()
    return <div key={location.pathname} className="route-fade">{children}</div>
}

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
            <AuthProvider>
                <WishlistProvider>
                <ProductProvider>
                    <InventoryProvider>
                        <CartProvider>
                            <AddressProvider>
                                <Router>
                                    <div className="App">
                                        <TopNav />
                                        <SiteBreadcrumbs />
                                        <RouteFade>
                                        <Suspense fallback={<PageLoader />}>
                                        <Routes>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/auth/callback" element={<AuthCallback />} />
                                            <Route path="/" element={<Home />} />
                                            <Route path="/legal" element={<Legal />} />
                                            <Route path="/search" element={<Search />} />
                                            <Route path="/product/:id" element={<ProductDetail />} />
                                            <Route path="/health-benefits" element={<HealthBenefits />} />
                                            <Route path="/recipes" element={<Recipes />} />
                                            <Route path="/recipes/:id" element={<RecipeDetail />} />
                                            <Route path="/farm-fresh" element={<FarmFresh />} />
                                            <Route path="/adopt-a-tree" element={<AdoptATree />} />
                                            <Route path="/coming-soon" element={<ComingSoon />} />
                                            <Route path="/information-centre" element={<InformationCentre />} />
                                            <Route path="/information-centre/:slug" element={<ArticleDetail />} />
                                            <Route path="/shop/:category" element={<ShopCategory />} />
                                            <Route path="/wishlist" element={<Wishlist />} />

                                            {/* Protected Routes */}
                                            <Route path="/cart" element={
                                                <ProtectedRoute>
                                                    <Cart />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/payment" element={
                                                <ProtectedRoute>
                                                    <Payment />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/order-confirmation" element={
                                                <ProtectedRoute>
                                                    <OrderConfirmation />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/profile" element={
                                                <ProtectedRoute>
                                                    <Profile />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/admin" element={<Admin />} />
                                            <Route path="/orders" element={
                                                <ProtectedRoute>
                                                    <MyOrders />
                                                </ProtectedRoute>
                                            } />
                                            <Route path="/orders/:orderId" element={
                                                <ProtectedRoute>
                                                    <OrderSummary />
                                                </ProtectedRoute>
                                            } />
                                        </Routes>
                                        </Suspense>
                                        </RouteFade>
                                        <BottomNav />
                                        <CartToast />
                                    </div>
                                </Router>
                            </AddressProvider>
                        </CartProvider>
                    </InventoryProvider>
                </ProductProvider>
                </WishlistProvider>
            </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    )
}

export default App
