import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { isBackendConfigured } from "@/integrations/supabase/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import Index from "./pages/Index.tsx";
const Favorites = lazy(() => import("./pages/Favorites.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Catalog = lazy(() => import("./pages/Catalog.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Account = lazy(() => import("./pages/Account.tsx"));
const Orders = lazy(() => import("./pages/Orders.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Sell = lazy(() => import("./pages/Sell.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Delivery = lazy(() => import("./pages/info/Delivery.tsx"));
const Payment = lazy(() => import("./pages/info/Payment.tsx"));
const Returns = lazy(() => import("./pages/info/Returns.tsx"));
const Privacy = lazy(() => import("./pages/info/Privacy.tsx"));
const Terms = lazy(() => import("./pages/info/Terms.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/Orders.tsx"));
const AdminProducts = lazy(() => import("./pages/admin/Products.tsx"));
const AdminCategories = lazy(() => import("./pages/admin/Categories.tsx"));
const AdminApplications = lazy(() => import("./pages/admin/Applications.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/Users.tsx"));
const AdminSupport = lazy(() => import("./pages/admin/Support.tsx"));
const Support = lazy(() => import("./pages/Support.tsx"));
const SellerDashboard = lazy(() => import("./pages/seller/Dashboard"));
const SellerOrders = lazy(() => import("./pages/seller/Orders"));
const SellerSettings = lazy(() => import("./pages/seller/Settings"));
const Security = lazy(() => import("./pages/Security"));
const Addresses = lazy(() => import("./pages/Addresses"));
const AdminCoupons = lazy(() => import("./pages/admin/Coupons"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));

const queryClient = new QueryClient();

const App = () => isBackendConfigured ? (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
            <Suspense fallback={<div role="status" className="p-16 text-center text-muted-foreground">Yuklanmoqda...</div>}><Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/security" element={<Security />} />
              <Route path="/account/addresses" element={<Addresses />} />
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
              <Route path="/admin/coupons" element={<AdminCoupons />} />
              <Route path="/admin/reviews" element={<AdminReviews />} />
              <Route path="/support" element={<Support />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/seller/products" element={<AdminProducts sellerMode />} />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/settings" element={<SellerSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes></Suspense>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
) : <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><div><h1 className="text-3xl font-semibold">DTPI Market</h1><p className="mt-4 text-muted-foreground">Sayt sozlanmoqda. Iltimos, birozdan so‘ng qayta tashrif buyuring.</p></div></div>;

export default App;
