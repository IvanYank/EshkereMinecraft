import { Outlet } from 'react-router';

import Header from '@/components/Header';

import styles from './MainLayout.module.scss'

export default function MainLayout() {
  return (
    <div className={styles.container}>
      <header>
        <Header />
      </header>
      <main >
        <Outlet />
      </main>
    </div>
  );
}
