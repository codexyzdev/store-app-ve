import { useMemo } from "react";
import { useAuth } from "./use-auth";

interface DashboardPermissions {
  canManageInventory: boolean;
  canViewReports: boolean;
  canManageCollections: boolean;
}

interface DashboardUserInfo {
  displayName?: string;
  role?: string;
  userProfile?: any;
}

interface UseDashboardReturn {
  permissions: DashboardPermissions;
  userInfo: DashboardUserInfo;
  isLoading: boolean;
}

export const useDashboard = (): UseDashboardReturn => {
  const {
    userProfile,
    canManageInventory,
    canViewReports,
    canManageCollections,
    loading
  } = useAuth();

  // Memoizar los permisos para evitar re-renders innecesarios
  const permissions = useMemo(() => ({
    canManageInventory,
    canViewReports,
    canManageCollections
  }), [canManageInventory, canViewReports, canManageCollections]);

  // Memoizar la información del usuario
  const userInfo = useMemo(() => ({
    displayName: userProfile?.displayName,
    role: userProfile?.role,
    userProfile
  }), [userProfile]);

  return {
    permissions,
    userInfo,
    isLoading: loading || false
  };
}; 