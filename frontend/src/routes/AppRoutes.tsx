import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Home from "../pages/Home";
import About from "../pages/About";
import Admin from "../pages/Admin";
import AdminProducts from "../pages/admin/Products";
import AdminUsers from "../pages/admin/Users";
import AdminOrders from "../pages/admin/Orders";
import Artisan from "../pages/Artisan";
import Consumer from "../pages/Consumer";
import ProductDetail from "../pages/ProductDetail";
import Profile from "../pages/Profile";
import MyProducts from "../pages/artisan/MyProducts";
import ArtisanOrders from "../pages/artisan/Orders";
import ProductList from "../pages/consumer/ProductList";
import Cart from "../pages/consumer/Cart";
import ConsumerOrders from "../pages/consumer/Orders";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/product/:id" element={<ProtectedRoute allowedRoles={['consumer']}><ProductDetail /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin"          element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin']}><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/users"    element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/orders"   element={<ProtectedRoute allowedRoles={['admin']}><AdminOrders /></ProtectedRoute>} />

            {/* Profile — both artisan and consumer */}
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['artisan', 'consumer']}><Profile /></ProtectedRoute>} />

            {/* Artisan routes */}
            <Route path="/artisan"          element={<ProtectedRoute allowedRoles={['artisan']}><Artisan /></ProtectedRoute>} />
            <Route path="/artisan/products" element={<ProtectedRoute allowedRoles={['artisan']}><MyProducts /></ProtectedRoute>} />
            <Route path="/artisan/orders"   element={<ProtectedRoute allowedRoles={['artisan']}><ArtisanOrders /></ProtectedRoute>} />

            {/* Consumer routes */}
            <Route path="/consumer"        element={<ProtectedRoute allowedRoles={['consumer']}><Consumer /></ProtectedRoute>} />
            <Route path="/consumer/shop"   element={<ProtectedRoute allowedRoles={['consumer']}><ProductList /></ProtectedRoute>} />
            <Route path="/consumer/cart"   element={<ProtectedRoute allowedRoles={['consumer']}><Cart /></ProtectedRoute>} />
            <Route path="/consumer/orders" element={<ProtectedRoute allowedRoles={['consumer']}><ConsumerOrders /></ProtectedRoute>} />
        </Routes>
    );
}
