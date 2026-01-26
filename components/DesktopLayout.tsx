import React from 'react';

interface DesktopLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ sidebar, children }) => {
    return (
        <div className="hidden lg:flex w-full h-screen overflow-hidden bg-background">
            {sidebar}
            <main className="flex-1 h-screen overflow-auto relative">
                <div className="max-w-5xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};
