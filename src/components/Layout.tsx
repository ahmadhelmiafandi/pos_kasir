import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 lg:pl-64 min-h-screen w-full transition-all duration-300">
        <div className="p-4 md:p-8 max-w-(--breakpoint-2xl) mx-auto pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
