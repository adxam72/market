import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileNav from "./MobileNav";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <MobileNav />
  </div>
);

export default Layout;
