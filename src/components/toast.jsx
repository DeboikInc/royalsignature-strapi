'use client'; // Mark as Client Component since we'll use useState and useEffect

import { useEffect, useState } from 'react';
import { XMarkIcon, CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const toastStyles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  const toastIcons = {
    success: <CheckIcon className="h-5 w-5 text-green-500" />,
    error: <XMarkIcon className="h-5 w-5 text-red-500" />,
    warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />,
    info: <InformationCircleIcon className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center p-4 mb-4 rounded-lg border-l-4 ${toastStyles[type]} shadow-lg`}>
        <div className="mr-2">
          {toastIcons[type]}
        </div>
        <div className="text-sm font-medium">
          {message}
        </div>
        <button
          onClick={() => setVisible(false)}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
