import React from 'react';
import { LayoutGrid, FolderOpen, Star, Settings, Plus } from 'lucide-react';
import { ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SidebarProps {
    activeTab: ScreenName;
    onNavigate: (screen: ScreenName) => void;
    lang?: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onNavigate, lang = 'EN' }) => {
    const t = TRANSLATIONS[lang].nav;

    const navItems: { id: ScreenName; label: string; icon: React.ElementType }[] = [
        { id: 'dashboard', label: t.files, icon: LayoutGrid },
        { id: 'folders', label: t.folders, icon: FolderOpen },
        { id: 'starred', label: t.starred, icon: Star },
        { id: 'settings', label: t.settings, icon: Settings },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-surface h-screen sticky top-0 border-r border-white/5">
            <div className="p-8">
                <h1 className="text-2xl font-black text-primary tracking-tighter flex items-center gap-2">
                    <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
                        <LayoutGrid size={20} className="text-black" fill="currentColor" />
                    </div>
                    PDF Archiv
                </h1>
            </div>

            <div className="px-4 mb-8">
                <button
                    onClick={() => onNavigate('upload')}
                    className="w-full bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <Plus size={24} strokeWidth={3} />
                    <span className="text-sm uppercase tracking-wider">Add Document</span>
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                                isActive
                                ? 'bg-primary/10 text-primary shadow-glow'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Icon
                                size={22}
                                strokeWidth={isActive ? 2.5 : 2}
                                fill={isActive ? "currentColor" : "none"}
                                className={isActive ? "drop-shadow-lg" : ""}
                            />
                            <span className="font-bold text-sm tracking-wide">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

        </aside>
    );
};