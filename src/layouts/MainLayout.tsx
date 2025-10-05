import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from '../components/ui/ScrollToTop';
import NyraChatbot from '../components/NyraChatbot';

export default function MainLayout() {
  return (
    <div className="bg-slate-100/70 text-slate-800">
      <ScrollToTop />
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <NyraChatbot />
      <Footer />
    </div>
  );
}