
import { currentUser } from "@clerk/nextjs/server";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default async function Dashboard() {
  const user = await currentUser();

  if (!user) {
   
    return <div>No estás autenticado.</div>;
  }

  return (
    <div className='flex flex-col items-center justify-center bg-white'>
      <main className='bg-gray-50 py-10 px-4'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-2xl font-bold text-gray-800'>Store App Ve</h1>
          <DashboardGrid />
        </div>
      </main>
    </div>
  );
}
