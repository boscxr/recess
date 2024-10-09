import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/ui/dashboard/header'; // Make sure this is the correct path for your header component

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">

      <div className="flex flex-grow">
        {/* Sidenav below the header */}
        <div className="w-14 flex-none">
          <SideNav />
        </div>

        {/* Main content */}
        <div className="flex-grow p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
