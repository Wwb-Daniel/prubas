import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white flex">
      <Navbar />
      
      <main className="flex-1 ml-20">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;