import Link from "next/link";

type DashboardCardProps = {
  title: string;
  icon: React.ReactNode;
  href?: string;
};

export const DashboardCard = ({ title, icon, href }: DashboardCardProps) => {
  const content = (
    <div className='bg-white p-4 rounded shadow hover:bg-gray-100 flex flex-col items-center'>
      <div className='text-2xl mb-2'>{icon}</div>
      <span className='text-sm font-semibold text-gray-700'>{title}</span>
    </div>
  );
   return href ? <Link href={href}>{content}</Link> : content;
};
