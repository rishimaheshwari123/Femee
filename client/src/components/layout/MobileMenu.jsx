import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaShoppingCart } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import Button from '../ui/Button';

const MobileMenu = ({
  isOpen,
  onClose,
  navLinks,
  token,
  user,
  cartItemsCount,
  onLogout,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-80 max-w-[85vw] h-screen bg-white shadow-xl z-50 lg:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link to="/" onClick={onClose}>
            <img src={logo} alt="Logo" className="h-12" />
          </Link>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
              onClick={onClose}
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Cart Link */}
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors"
          >
            <span className="flex items-center gap-2">
              <FaShoppingCart />
              Cart
            </span>
            {cartItemsCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {token ? (
            <>
              {(user?.role === 'admin' || user?.role === 'member') && (
                <Button
                  to={`/${user.role}/dashboard`}
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                >
                  Dashboard
                </Button>
              )}
              <Button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                variant="danger"
                fullWidth
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                to="/user-login"
                variant="ghost"
                fullWidth
                onClick={onClose}
              >
                User Login
              </Button>
              <Button
                to="/login"
                variant="outline"
                fullWidth
                onClick={onClose}
              >
                Member Login
              </Button>
              <Button
                to="/become-member/meenusahu"
                variant="primary"
                fullWidth
                onClick={onClose}
              >
                Membership
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
