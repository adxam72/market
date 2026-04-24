import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Index from "./pages/Index.tsx";
import Favorites from "./pages/Favorites.tsx";
import NotFound from "./pages/NotFound.tsx";
import Catalog from "./pages/Catalog.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Auth from "./pages/Auth.tsx";
import Account from "./pages/Account.tsx";
import Orders from "./pages/Orders.tsx";
import About from "./pages/About.tsx";
import Sell from "./pages/Sell.tsx";
import FAQ from "./pages/FAQ.tsx";
import Delivery from "./pages/info/Delivery.tsx";
import Payment from "./pages/info/Payment.tsx";
import Returns from "./pages/info/Returns.tsx";
import Privacy from "./pages/info/Privacy.tsx";
import Terms from "./pages/info/Terms.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminOrders from "./pages/admin/Orders.tsx";
import AdminProducts from "./pages/admin/Products.tsx";
import AdminCategories from "./pages/admin/Categories.tsx";
import AdminApplications from "./pages/admin/Applications.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminSupport from "./pages/admin/Support.tsx";
import Support from "./pages/Support.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/orders" element={<Orders />} />
              <Route path="/account/favorites" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/info/delivery" element={<Delivery />} />
              <Route path="/info/payment" element={<Payment />} />
              <Route path="/info/returns" element={<Returns />} />
              <Route path="/info/privacy" element={<Privacy />} />
              <Route path="/info/terms" element={<Terms />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/support" element={<AdminSupport />} />
              <Route path="/support" element={<Support />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
