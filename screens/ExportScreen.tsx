import React, { useState } from 'react';
import { ChevronLeft, FileText, Printer, StickyNote, Info } from 'lucide-react';
import { FileItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';
import { PopupNotice } from '../components/PopupNotice';

interface ExportScreenProps {
    files: FileItem[];
    onBack: () => void;
    lang: Language;
}

export const ExportScreen: React.FC<ExportScreenProps> = ({ files, onBack, lang }) => {
    const t = TRANSLATIONS[lang].export;
    const filesInRange = files;
    const [popupMessage, setPopupMessage] = useState<string | null>(null);

    const handlePrint = () => {
        if (filesInRange.length === 0) {
            setPopupMessage('No files to export.');
            return;
        }
        // Simulate print
        const confirmMsg = `Prepare print for ${filesInRange.length} documents?\n\n${filesInRange.map(f => `- ${f.name}`).join('\n')}`;
        if(window.confirm(confirmMsg)) {
             window.print();
        }
    };

    return (
        <div className="min-h-screen bg-background text-gray-100 font-display animate-fade-in pb-40 overflow-y-auto transition-colors duration-300 relative">
            {popupMessage && (
                <PopupNotice message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}
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
