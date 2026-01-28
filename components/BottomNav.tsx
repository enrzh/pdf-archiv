import React from 'react';
import { LayoutGrid, FolderOpen, Star, Settings, Plus } from 'lucide-react';
import { ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface BottomNavProps {
    activeTab: ScreenName;
    onNavigate: (screen: ScreenName) => void;
    lang?: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate, lang = 'EN' }) => {
    const t = TRANSLATIONS[lang].nav;
    return (
        <div className="bg-surface/95 backdrop-blur-xl px-6 pb-8 pt-4 flex justify-between items-center z-50 transition-all duration-300 lg:hidden border-t border-white/5">
            <button 
                onClick={() => onNavigate('dashboard')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === 'dashboard' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <LayoutGrid size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} fill={activeTab === 'dashboard' ? "currentColor" : "none"} className={activeTab === 'dashboard' ? "opacity-100 drop-shadow-lg shadow-primary/50" : ""} />
                <span className="text-[10px] font-bold tracking-wide">{t.files}</span>
            </button>
            
            <button 
                onClick={() => onNavigate('folders')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === 'folders' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <FolderOpen size={24} strokeWidth={activeTab === 'folders' ? 2.5 : 2} fill={activeTab === 'folders' ? "currentColor" : "none"} className={activeTab === 'folders' ? "drop-shadow-lg shadow-primary/50" : ""} />
                <span className="text-[10px] font-bold tracking-wide">{t.folders}</span>
            </button>
            
            {/* Central Add Button */}
            <button
                onClick={() => onNavigate('upload')}
                className="size-14 bg-primary rounded-full shadow-glow text-background flex items-center justify-center active:scale-95 transition-all hover:scale-105"
            >
                <Plus size={32} strokeWidth={3} />
            </button>

            <button 
                onClick={() => onNavigate('starred')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === 'starred' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <Star size={24} strokeWidth={activeTab === 'starred' ? 2.5 : 2} fill={activeTab === 'starred' ? "currentColor" : "none"} className={activeTab === 'starred' ? "drop-shadow-lg shadow-primary/50" : ""} />
                <span className="text-[10px] font-bold tracking-wide">{t.starred}</span>
            </button>
            
            <button 
                onClick={() => onNavigate('settings')}
                className={`flex flex-col items-center gap-1.5 transition-all active:scale-95 ${activeTab === 'settings' ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
            >
                <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} className={activeTab === 'settings' ? "animate-spin-slow drop-shadow-lg shadow-primary/50" : ""}/>
                <span className="text-[10px] font-bold tracking-wide">{t.settings}</span>
            </button>
        </div>
    );
};