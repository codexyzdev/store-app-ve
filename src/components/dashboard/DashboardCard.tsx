import Link from "next/link";

type DashboardCardProps = {
  title: string;
  icon: React.ReactNode;
  href?: string;
};

export const DashboardCard = ({ title, icon, href }: DashboardCardProps) => {
  const content = (
    <div className='group relative bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[160px] flex flex-col justify-center items-center text-center'>
      {/* Efecto de gradiente sutil en hover */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/60 group-hover:to-indigo-50/40 rounded-2xl transition-all duration-300' />

      {/* Contenido */}
      <div className='relative z-10 flex flex-col items-center gap-4'>
        <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg'>
          <div className='text-white group-hover:scale-110 transition-transform duration-300'>
            {icon}
          </div>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300'>
          {title}
        </h3>
      </div>

      {/* Indicador de hover mejorado */}
      <div className='absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100' />

      {/* Flecha de navegación */}
      <div className='absolute bottom-4 right-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0'>
        <span className='text-lg'>→</span>
      </div>
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
