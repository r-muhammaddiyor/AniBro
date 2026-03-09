import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

const MainLayout = () => (
  <div className="min-h-screen">
    <Header />
    <main className="pb-16 pt-24">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
