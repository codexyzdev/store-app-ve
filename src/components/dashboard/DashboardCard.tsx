import Link from "next/link";

type DashboardCardProps = {
  title: string;
  icon: React.ReactNode;
  href?: string;
};

export const DashboardCard = ({ title, icon, href }: DashboardCardProps) => {
  const content = (
    <div className='group relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer min-h-[140px] flex flex-col justify-center items-center text-center'>
      {/* Efecto de gradiente sutil en hover */}
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-50/0 to-blue-50/0 group-hover:from-indigo-50/50 group-hover:to-blue-50/30 rounded-xl transition-all duration-200' />

      {/* Contenido */}
      <div className='relative z-10 flex flex-col items-center gap-3'>
        <div className='text-indigo-600 group-hover:text-indigo-700 transition-colors'>
          {icon}
        </div>
        <h3 className='text-lg font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors'>
          {title}
        </h3>
      </div>

      {/* Indicador de hover */}
      <div className='absolute bottom-2 right-2 w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200' />
    </div>
  );

  return href ? (
    <Link href={href} className='block'>
      {content}
    </Link>
  ) : (
    content
  );
};
