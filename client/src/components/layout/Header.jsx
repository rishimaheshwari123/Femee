import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../../assets/logo.png';
import { memberLogout } from '../../services/operations/memeber';
import Button from '../ui/Button';
import Container from '../ui/Container';
import MobileMenu from './MobileMenu';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { token, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  
  const cartItemsCount = cart?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    dispatch(memberLogout(navigate));
  };

  const navLinks = [
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Gallery', to: '/gallery' },
    { name: 'Shop', to: '/shop' },
    { name: 'Contact', to: '/contact' },
  ];

  return (
    <header className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-xl' 
        : 'bg-white shadow-md'
    }`}>
      <Container>
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transform hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="Femme Cure" className="h-14 sm:h-16" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="relative text-dark-700 hover:text-primary-600 font-semibold transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-3 rounded-full hover:bg-primary-50 transition-all duration-300 group"
            >
              <FaShoppingCart className="text-xl text-dark-700 group-hover:text-primary-600 transition-colors" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons */}
            {token ? (
              <div className="flex items-center gap-3">
                {(user?.role === 'admin' || user?.role === 'member') && (
                  <Button
                    to={`/${user.role}/dashboard`}
                    variant="outline"
                    size="sm"
                  >
                    Dashboard
                  </Button>
                )}
                <Button onClick={handleLogout} variant="danger" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button to="/user-login" variant="ghost" size="sm">
                  <FaUser className="mr-2" />
                  Login
                </Button>
                <Button
                  to="/become-member/meenusahuADMIN"
                  variant="primary"
                  size="sm"
                >
                  Join Now
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-3 rounded-full hover:bg-primary-50 transition-all duration-300"
          >
            <FaBars className="text-2xl text-dark-700" />
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        token={token}
        user={user}
        cartItemsCount={cartItemsCount}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
