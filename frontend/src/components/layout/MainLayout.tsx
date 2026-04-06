import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col w-full min-h-screen bg-[#F0F9F9]">        
            <Header />
            <main className="w-full grow flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
