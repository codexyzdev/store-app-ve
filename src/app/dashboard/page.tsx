"use client";

import { memo } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUI } from "@/hooks/useUI";
import { useDashboard } from "@/hooks/useDashboard";
import {
  WelcomeHeader,
  NavigationGrid,
  UserInfoSection,
  DevelopmentDemo,
} from "@/components/dashboard";

const DashboardContent = memo(() => {
  const { permissions, userInfo, isLoading } = useDashboard();
  const { showNotification } = useUI();

  if (isLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <WelcomeHeader displayName={userInfo.displayName} role={userInfo.role} />

      <NavigationGrid {...permissions} />

      {/* Demo Redux - Solo en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <DevelopmentDemo showNotification={showNotification} />
      )}

      <UserInfoSection userProfile={userInfo.userProfile} />
    </div>
  );
});

DashboardContent.displayName = "DashboardContent";

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};

export default DashboardPage;
