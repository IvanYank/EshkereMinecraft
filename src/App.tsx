import { Route, Routes } from 'react-router';
import MainLayout from './layout/MainLayout';
import Home from './pages/Home';
import Page404 from './pages/Page404';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path='*' element={<Page404 />} />
      </Route>
    </Routes>
  );
}
