import React, { useState } from 'react';
import { ChevronLeft, FileText, Star, PenLine, X, Check, Calendar, Tag, Share, Eye, EyeOff } from 'lucide-react';
import { FileItem, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ViewerScreenProps {
    file: FileItem;
    onBack: () => void;
    onExport: () => void;
    onDelete: () => void;
    onToggleStar: (id: string) => void;
    onToggleRead: (id: string) => void;
    lang: Language;
    availableTags: string[];
}

export const ViewerScreen: React.FC<ViewerScreenProps> = ({ file, onBack, onExport, onDelete, onToggleStar, onToggleRead, lang, availableTags }) => {
    const t = TRANSLATIONS[lang].viewer;
    const [isEditing, setIsEditing] = useState(false);
    const [editDate, setEditDate] = useState(file.date);
    const [editTags, setEditTags] = useState(file.tags);

    // Toggle Edit Modal
    const toggleEdit = () => {
        if (isEditing) {
            // "Save" (Mock)
            setIsEditing(false);
        } else {
            setIsEditing(true);
        }
    };

    const toggleTag = (tag: string) => {
        if (editTags.includes(tag)) {
            setEditTags(prev => prev.filter(t => t !== tag));
        } else {
            setEditTags(prev => [...prev, tag]);
        }
    };

    return (
        <div className="h-screen bg-background flex flex-col text-white animate-fade-in relative overflow-hidden transition-colors duration-300">
            
            {/* Main Content (Full Screen PDF) */}
            <main className="absolute inset-0 z-0 bg-background flex items-center justify-center">
                {file.fileUrl ? (
                     <iframe 
                        src={`${file.fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
                        className="w-full h-full border-none" 
                        title="PDF Viewer"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <FileText size={64} />
                        <p className="mt-4">{t.pdfError}</p>
                    </div>
                )}
            </main>

            {/* Top Left: Back Bubble */}
            <button 
                onClick={onBack} 
                className="absolute top-6 left-6 z-20 size-12 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg active:scale-95 transition-all hover:bg-surface"
            >
                <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {/* Top Right Group */}
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                 {/* Star Bubble */}
                <button 
                    onClick={() => onToggleStar(file.id)}
                    className={`size-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 ${file.isStarred ? 'bg-yellow-500/90 text-black border-transparent' : 'bg-surface/80 text-white/90 hover:bg-surface'}`}
                >
                    <Star size={22} fill={file.isStarred ? "currentColor" : "none"} strokeWidth={file.isStarred ? 0 : 2.5} />
                </button>

                 {/* Read Toggle Bubble */}
                <button 
                    onClick={() => onToggleRead(file.id)}
                    className={`size-12 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 ${!file.isRead ? 'bg-blue-500/90 text-white border-transparent' : 'bg-surface/80 text-white/90 hover:bg-surface'}`}
                >
                    {file.isRead ? (
                         <EyeOff size={22} strokeWidth={2.5} />
                    ) : (
                         <Eye size={22} strokeWidth={2.5} />
                    )}
                </button>

                {/* Export Bubble */}
                <button 
                    onClick={onExport}
                    className="size-12 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-white/90 shadow-lg active:scale-95 transition-all hover:bg-surface"
                >
                    <Share size={22} strokeWidth={2.5} />
                </button>
            </div>


            {/* Bottom Right: Edit Bubble */}
            <button 
                onClick={() => setIsEditing(true)}
                className="absolute bottom-8 right-6 z-20 size-14 rounded-[20px] bg-primary text-black shadow-glow flex items-center justify-center active:scale-95 transition-transform hover:brightness-110"
            >
                <PenLine size={26} strokeWidth={2.5} />
            </button>

            {/* Edit Modal / Bubble Overlay */}
            {isEditing && (
                <div className="absolute inset-0 z-50 flex items-center justify-center px-6 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditing(false)}></div>
                    
                    <div className="relative bg-surface w-full max-w-sm rounded-[32px] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white tracking-tight">{t.editDetails}</h3>
                            <button onClick={() => setIsEditing(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Date Edit */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 block ml-1">{t.archiveDate}</label>
                            <div className="flex items-center gap-3 bg-background p-3.5 rounded-2xl transition-colors">
                                <Calendar size={20} className="text-primary" />
                                <input 
                                    type="date" 
                                    value={editDate.toISOString().split('T')[0]} 
                                    onChange={(e) => setEditDate(new Date(e.target.value))}
                                    className="bg-transparent border-none text-white font-bold w-full focus:ring-0 p-0 text-base"
                                />
                            </div>
                        </div>

                        {/* Tags Edit */}
                        <div className="mb-8">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 block ml-1">{t.category}</label>
                            <div className="flex flex-wrap gap-2.5">
                                {availableTags.map(tag => (
                                    <button 
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                            editTags.includes(tag) 
                                            ? 'bg-secondary text-black' 
                                            : 'bg-background text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <Tag size={12} strokeWidth={2.5} />
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={toggleEdit}
                            className="w-full py-4 rounded-2xl bg-primary text-black font-black flex items-center justify-center gap-2 text-base shadow-glow active:scale-[0.98] transition-all hover:brightness-110"
                        >
                            <Check size={20} strokeWidth={3} />
                            {t.saveChanges}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};