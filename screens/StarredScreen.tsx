import React from 'react';
import { Star, FileText, MoreVertical, BadgeCheck, ArrowLeft } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { FileItem, ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface StarredScreenProps {
    files: FileItem[];
    onNavigate: (screen: ScreenName) => void;
    onFileSelect: (id: string) => void;
    lang: Language;
}

export const StarredScreen: React.FC<StarredScreenProps> = ({ files, onNavigate, onFileSelect, lang }) => {
    const t = TRANSLATIONS[lang].starred;
    const starredFiles = files.filter(f => f.isStarred);

    return (
        <div className="min-h-screen bg-background text-gray-100 pb-24 animate-fade-in flex flex-col h-full transition-colors duration-300">
            
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md px-4 pt-8 pb-4 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center">
                        <Star size={28} className="text-yellow-500" fill="currentColor" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{t.title}</h1>
                        <p className="text-xs text-gray-500 font-medium">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 mt-6 flex-1 overflow-y-auto pb-24">
                {starredFiles.length > 0 ? (
                    <div className="space-y-3">
                        {starredFiles.map((file) => (
                            <div key={file.id} onClick={() => onFileSelect(file.id)} className="group cursor-pointer flex items-center gap-4 bg-surface p-3 rounded-2xl shadow-sm active:scale-[0.98] transition-all hover:bg-white/5">
                                <div className={`size-14 shrink-0 rounded-xl flex items-center justify-center ${file.color}`}>
                                    <FileText size={32} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-100 truncate">{file.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[11px] font-medium text-gray-500">{file.size}</span>
                                        <span className="size-1 rounded-full bg-gray-500"></span>
                                        <span className="text-[11px] font-medium text-gray-500">
                                            {file.date.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'))}
                                        </span>
                                    </div>
                                    <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
                                        {file.tags.map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 shrink-0 bg-card text-gray-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button className="size-8 flex items-center justify-center text-yellow-500/80 hover:text-yellow-400 transition-colors">
                                    <Star size={18} fill="currentColor" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 text-center px-8">
                        <div className="size-20 rounded-full bg-surface flex items-center justify-center mb-4">
                            <Star size={32} className="text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{t.emptyTitle}</h3>
                        <p className="text-sm text-gray-500">{t.emptySub}</p>
                    </div>
                )}
            </div>

            <BottomNav activeTab="starred" onNavigate={onNavigate} lang={lang} />
        </div>
    );
};