import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AdminLoginPage from '@/pages/admin-login-page';
import AdminManagePage from '@/pages/admin-manage-page';
import CatalogPage from '@/pages/catalog-page';
import DetailPage from '@/pages/detail-page';
import HomePage from '@/pages/home-page';

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:resource" element={<CatalogPage />} />
      <Route path="/:resource/:id" element={<DetailPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/manage" element={<AdminManagePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
