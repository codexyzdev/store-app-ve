import { memo } from "react";

interface UserProfile {
  email?: string;
  role?: string;
  lastLogin?: string;
}

interface UserInfoSectionProps {
  userProfile?: UserProfile;
}

export const UserInfoSection = memo(({ userProfile }: UserInfoSectionProps) => {
  return (
    <div className='mt-8 bg-gray-50 rounded-lg p-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-4'>
        Información de tu cuenta
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <span className='text-sm font-medium text-gray-600'>Email:</span>
          <p className='text-gray-800'>{userProfile?.email}</p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-600'>Rol:</span>
          <p className='text-gray-800 capitalize'>{userProfile?.role}</p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-600'>
            Último acceso:
          </span>
          <p className='text-gray-800'>
            {userProfile?.lastLogin
              ? new Date(userProfile.lastLogin).toLocaleString("es-ES")
              : "Nunca"}
          </p>
        </div>
        <div>
          <span className='text-sm font-medium text-gray-600'>Estado:</span>
          <p className='text-green-600 font-semibold'>Activo</p>
        </div>
      </div>
    </div>
  );
});

UserInfoSection.displayName = "UserInfoSection";
