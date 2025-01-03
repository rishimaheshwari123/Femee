import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Backdrop = ({ onClick }) => {
  // Disable scrolling when the backdrop is displayed
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 bottom-0 right-0 bg-gray-900 bg-opacity-50 z-40 backdrop-blur-sm inset-0"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    ></motion.div>
  );
};

export default Backdrop;
