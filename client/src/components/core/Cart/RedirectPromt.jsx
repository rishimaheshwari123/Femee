import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedirectPrompt = ({ message, onConfirm, onCancel }) => {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onConfirm();
    navigate('/');
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-red p-6 rounded-md shadow-lg">
        <p className="text-lg mb-4">{message}</p>
        <div className="flex justify-end gap-4">
          <button onClick={handleCancel} className="button button-secondary">
            Cancel
          </button>
          <button onClick={handleConfirm} className="button">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedirectPrompt;
