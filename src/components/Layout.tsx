import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="pl-64 min-h-screen">
        <div className="p-8 max-w-(--breakpoint-2xl) mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
