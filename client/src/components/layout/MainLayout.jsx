import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SubNavbar from '../comman/SubNavbar';

const MainLayout = ({ children }) => {
  const location = useLocation();

  // Paths where Header and Footer should not be shown
  const hideLayout =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/member');

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SubNavbar />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
