import { Outlet } from 'react-router';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout() {
  return (
    <div>
      <header>
        <Header/>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <Footer/>
      </footer>
    </div>
  );
}
