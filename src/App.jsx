import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { ProductProvider } from './context/ProductContext'
import { InventoryProvider } from './context/InventoryContext'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Search from './pages/Search'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Payment from './pages/Payment'
import OrderConfirmation from './pages/OrderConfirmation'
import Profile from './pages/Profile'
import HealthBenefits from './pages/HealthBenefits'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import MyOrders from './pages/MyOrders'
import OrderSummary from './pages/OrderSummary'
import Legal from './pages/Legal'
import FarmFresh from './pages/FarmFresh'
import './App.css'

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ProductProvider>
                    <InventoryProvider>
                        <CartProvider>
                            <AddressProvider>
                                <Router>
                                    <div className="App">
                                        <Routes>
                                            <Route path="/login" element={<Login />} />
                                            <Route path="/" element={<Home />} />
                                            <Route path="/legal" element={<Legal />} />
                                            <Route path="/search" element={<Search />} />
                                            <Route path="/product/:id" element={<ProductDetail />} />
                                            <Route path="/health-benefits" element={<HealthBenefits />} />
                                            <Route path="/recipes" element={<Recipes />} />
                                            <Route path="/recipes/:id" element={<RecipeDetail />} />
                                            <Route path="/farm-fresh" element={<FarmFresh />} />

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
                                        <BottomNav />
                                    </div>
                                </Router>
                            </AddressProvider>
                        </CartProvider>
                    </InventoryProvider>
                </ProductProvider>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
