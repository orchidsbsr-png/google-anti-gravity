import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { ProductProvider } from './context/ProductContext'
import { InventoryProvider } from './context/InventoryContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AuthCallback from './pages/AuthCallback'
import './App.css'

// Route-level code splitting — Home stays eager for instant first paint,
// everything else loads on demand.
const Search = lazy(() => import('./pages/Search'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Payment = lazy(() => import('./pages/Payment'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Profile = lazy(() => import('./pages/Profile'))
const HealthBenefits = lazy(() => import('./pages/HealthBenefits'))
const Recipes = lazy(() => import('./pages/Recipes'))
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'))
const Admin = lazy(() => import('./pages/Admin'))
const Login = lazy(() => import('./pages/Login'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const OrderSummary = lazy(() => import('./pages/OrderSummary'))
const Legal = lazy(() => import('./pages/Legal'))
const FarmFresh = lazy(() => import('./pages/FarmFresh'))
const AdoptATree = lazy(() => import('./pages/AdoptATree'))

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
                <ProductProvider>
                    <InventoryProvider>
                        <CartProvider>
                            <AddressProvider>
                                <Router>
                                    <div className="App">
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
                                    </div>
                                </Router>
                            </AddressProvider>
                        </CartProvider>
                    </InventoryProvider>
                </ProductProvider>
            </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    )
}

export default App
