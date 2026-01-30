import React from 'react';
import type { ScreenName } from '../types';

interface DesktopLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    screen?: ScreenName;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ sidebar, children, screen }) => {
    return (
        <div className="hidden lg:flex w-full h-screen overflow-hidden bg-background">
            {sidebar}
            <main className={`flex-1 h-screen ${screen === 'viewer' ? 'overflow-hidden' : 'overflow-auto'} relative`}>
                <div className={`${screen === 'viewer' ? 'w-full h-full' : 'max-w-5xl mx-auto w-full'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
};
