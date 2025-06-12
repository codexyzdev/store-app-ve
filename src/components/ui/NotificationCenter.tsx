"use client";

import { useUI } from "@/hooks/useUI";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

export function NotificationCenter() {
  const { notifications, hideNotification } = useUI();

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm'>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </div>
  );
}

interface NotificationItemProps {
  notification: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    message: string;
    timestamp: number;
  };
  onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  // Auto-cerrar después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  return (
    <div
      className={`
        ${getStyles()}
        border rounded-lg p-4 shadow-lg
        animate-in slide-in-from-right-5 duration-200
        max-w-sm w-full
      `}
    >
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3'>
          <span className='text-lg flex-shrink-0'>{getIcon()}</span>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium'>{notification.message}</p>
            <p className='text-xs opacity-75 mt-1'>
              {new Date(notification.timestamp).toLocaleTimeString("es-ES")}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className='flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/10 transition-colors'
        >
          <XMarkIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
