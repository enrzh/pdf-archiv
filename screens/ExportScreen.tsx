import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Printer, FileType, StickyNote, Info } from 'lucide-react';
import { FileItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ExportScreenProps {
    files: FileItem[];
    onBack: () => void;
    lang: Language;
}

type RangeType = 'daily' | 'weekly' | 'monthly';

export const ExportScreen: React.FC<ExportScreenProps> = ({ files, onBack, lang }) => {
    const t = TRANSLATIONS[lang].export;
    const [range, setRange] = useState<RangeType>('weekly');
    const [referenceDate, setReferenceDate] = useState(new Date());

    // Calculate files in range
    const getFilesInRange = () => {
        return files.filter(f => {
            const fileDate = new Date(f.date);
            if (range === 'daily') {
                return fileDate.toDateString() === referenceDate.toDateString();
            }
            if (range === 'monthly') {
                return fileDate.getMonth() === referenceDate.getMonth() && 
                       fileDate.getFullYear() === referenceDate.getFullYear();
            }
            if (range === 'weekly') {
                // Simple week check (same iso week or roughly same 7 day window)
                // Let's do same week number
                const oneJan = new Date(fileDate.getFullYear(), 0, 1);
                const numberOfDays = Math.floor((fileDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
                const weekNum = Math.ceil((fileDate.getDay() + 1 + numberOfDays) / 7);
                
                const refOneJan = new Date(referenceDate.getFullYear(), 0, 1);
                const refDays = Math.floor((referenceDate.getTime() - refOneJan.getTime()) / (24 * 60 * 60 * 1000));
                const refWeekNum = Math.ceil((referenceDate.getDay() + 1 + refDays) / 7);
                
                return weekNum === refWeekNum && fileDate.getFullYear() === referenceDate.getFullYear();
            }
            return false;
        });
    };

    const filesInRange = getFilesInRange();

    const handlePrint = () => {
        if (filesInRange.length === 0) {
            alert("No files to export in this range.");
            return;
        }
        // Simulate print
        const confirmMsg = `Prepare print for ${filesInRange.length} documents?\n\n${filesInRange.map(f => `- ${f.name}`).join('\n')}`;
        if(window.confirm(confirmMsg)) {
             window.print();
        }
    };

    const changeDate = (offset: number) => {
        const newDate = new Date(referenceDate);
        if (range === 'daily') newDate.setDate(newDate.getDate() + offset);
        if (range === 'weekly') newDate.setDate(newDate.getDate() + (offset * 7));
        if (range === 'monthly') newDate.setMonth(newDate.getMonth() + offset);
        setReferenceDate(newDate);
    };

    return (
        <div className="min-h-screen bg-background text-gray-100 font-display animate-fade-in pb-40 overflow-y-auto transition-colors duration-300 relative">
            {/* Floating Back Button */}
            <div className="sticky top-0 z-50 p-6 pointer-events-none">
                <button 
                    onClick={onBack} 
                    className="pointer-events-auto size-12 rounded-full bg-surface/80 backdrop-blur-xl shadow-2xl flex items-center justify-center text-secondary active:scale-95 transition-all hover:bg-surface hover:scale-105"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
            </div>

            <main className="max-w-md mx-auto px-4 pt-2">
                 <div className="px-2 mb-8">
                     <h1 className="text-3xl font-black text-white tracking-tight mb-1">{t.title}</h1>
                     <p className="text-sm text-gray-500 font-medium">{t.subtitle}</p>
                </div>

                <h3 className="text-gray-500 text-[13px] font-bold uppercase tracking-wider mb-3 px-1">{t.selectRange}</h3>
                <div className="flex bg-surface p-1 rounded-xl">
                    <label className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg transition-all has-[:checked]:bg-card has-[:checked]:shadow-lg has-[:checked]:text-white text-gray-500 text-sm font-semibold">
                        <span>{t.daily}</span>
                        <input 
                            type="radio" 
                            name="range" 
                            checked={range === 'daily'} 
                            onChange={() => setRange('daily')} 
                            className="hidden" 
                        />
                    </label>
                    <label className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg transition-all has-[:checked]:bg-card has-[:checked]:shadow-lg has-[:checked]:text-white text-gray-500 text-sm font-semibold">
                        <span>{t.weekly}</span>
                        <input 
                            type="radio" 
                            name="range" 
                            checked={range === 'weekly'} 
                            onChange={() => setRange('weekly')} 
                            className="hidden" 
                        />
                    </label>
                    <label className="flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg transition-all has-[:checked]:bg-card has-[:checked]:shadow-lg has-[:checked]:text-white text-gray-500 text-sm font-semibold">
                        <span>{t.monthly}</span>
                        <input 
                            type="radio" 
                            name="range" 
                            checked={range === 'monthly'} 
                            onChange={() => setRange('monthly')} 
                            className="hidden" 
                        />
                    </label>
                </div>

                <div className="mt-8">
                    <div className="bg-surface rounded-2xl shadow-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={() => changeDate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 text-secondary">
                                <ChevronLeft size={24} />
                            </button>
                            <p className="text-white text-base font-bold">
                                {range === 'daily' && referenceDate.toLocaleDateString()}
                                {range === 'weekly' && `Week of ${referenceDate.toLocaleDateString()}`}
                                {range === 'monthly' && referenceDate.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'), { month: 'long', year: 'numeric' })}
                            </p>
                            <button onClick={() => changeDate(1)} className="size-10 flex items-center justify-center rounded-full hover:bg-white/5 text-secondary">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                        
                        {/* Simplified visualizer */}
                        <div className="flex justify-center items-center h-20 text-gray-500 text-sm">
                            {filesInRange.length} {t.docsInRange}
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h3 className="text-gray-500 text-[13px] font-bold uppercase tracking-wider mb-4 px-1">{t.exportOptions}</h3>
                    <div className="bg-surface rounded-2xl overflow-hidden">
                        <label className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center">
                                    <StickyNote size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[15px] text-white">{t.includeNotes}</p>
                                    <p className="text-xs text-gray-500">{t.includeNotesSub}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input type="checkbox" defaultChecked className="peer sr-only" />
                                <div className="w-6 h-6 bg-white/10 rounded-full peer-checked:bg-secondary flex items-center justify-center transition-all">
                                    <svg className="w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                        </label>
                        
                        <label className="flex items-center justify-between p-4 cursor-pointer active:bg-white/5 transition-colors border-t border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="size-10 bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-[15px] text-white">{t.pageNumbers}</p>
                                    <p className="text-xs text-gray-500">{t.pageNumbersSub}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <input type="checkbox" className="peer sr-only" />
                                <div className="w-6 h-6 bg-white/10 rounded-full peer-checked:bg-secondary flex items-center justify-center transition-all">
                                    <svg className="w-3.5 h-3.5 text-black opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="bg-secondary/10 p-4 rounded-2xl flex items-start gap-3">
                        <Info size={20} className="text-secondary shrink-0 mt-0.5" />
                        <p className="text-sm text-secondary/90 font-medium leading-tight">
                            {t.found} <span className="font-extrabold text-white">{filesInRange.length} {lang === 'DE' ? 'Dokumente' : (lang === 'CN' ? '文档' : 'Documents')}</span>.
                        </p>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl px-4 pt-4 pb-10 z-50 transition-colors duration-300">
                <div className="max-w-md mx-auto">
                    <button onClick={handlePrint} className="w-full bg-secondary hover:brightness-110 text-black py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-secondary/20 active:scale-[0.98] transition-all">
                        <Printer size={20} strokeWidth={3} />
                        {t.printPdf}
                    </button>
                </div>
            </div>
        </div>
    );
};