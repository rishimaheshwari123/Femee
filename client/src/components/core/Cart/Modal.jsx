// Modal.js
import React from 'react';
import { motion } from 'framer-motion';
import { RxCrossCircled } from "react-icons/rx";

const Modal = ({ show, handleClose, children }) => {
  const showHideClassName = show ? "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50" : "hidden";

  return (
    <div className={showHideClassName}>
      <motion.div
        className="bg-white rounded-lg shadow-lg p-8 lg:w-[calc(100vw-10rem)] w-[calc(100vw-10px)] relative"
        initial={{ opacity: 0, y: "-100vh" }}
        animate={{ opacity: 1, y: "0" }}
        exit={{ opacity: 0, y: "-100vh" }}
        transition={{ duration: 0.5 }}
      >
        {children}
        <button className="bg-red-700  rounded-full text-red-100 p-1  absolute  top-1 right-1 text-xl" onClick={handleClose}><RxCrossCircled />
</button>
      </motion.div>
    </div>
  );
};

export default Modal;
