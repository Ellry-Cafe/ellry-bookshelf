import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function BorrowerModal({ isOpen, onClose, onConfirm }) {
  const [contactNumber, setContactNumber] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-md p-6 w-[90%] max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Enter Borrower Contact Number</h2>
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!contactNumber.trim()) {
                toast.error('Please enter a contact number');
                return;
              }
              onConfirm(contactNumber.trim());
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
