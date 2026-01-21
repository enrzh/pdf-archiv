import React, { useRef, useState } from 'react';
import { ChevronLeft, CloudUpload, RefreshCw, Trash2, ChevronRight, CheckCircle, Info, Receipt, Plus, FileText, Zap, Loader2, X, Paperclip } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface UploadScreenProps {
    onBack: () => void;
    onArchive: (files: { file: File, size: string }[], date: Date, tags: string[]) => void | Promise<void>;
    lang: Language;
    availableTags: string[];
}

interface UploadFileState {
    id: string;
    file: File;
    displaySize: number;
    isCompressing: boolean;
    isCompressed: boolean;
}

export const UploadScreen: React.FC<UploadScreenProps> = ({ onBack, onArchive, lang, availableTags }) => {
    const t = TRANSLATIONS[lang].upload;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<UploadFileState[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    // Calendar logic
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentMonth);
    const prevMonthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles: UploadFileState[] = (Array.from(e.target.files) as File[])
                .filter(file => file.type === 'application/pdf')
                .map(file => ({
                    id: generateId(),
                    file,
                    displaySize: file.size,
                    isCompressing: true,
                    isCompressed: false
                }));

            if (newFiles.length === 0) {
                alert('Please upload PDF files only.');
                return;
            }

            setUploadedFiles(prev => [...prev, ...newFiles]);

            // Simulate compression for each new file
            newFiles.forEach(fileState => {
                setTimeout(() => {
                    setUploadedFiles(current => 
                        current.map(f => 
                            f.id === fileState.id 
                            ? { ...f, displaySize: f.file.size * 0.65, isCompressing: false, isCompressed: true }
                            : f
                        )
                    );
                }, 1500 + Math.random() * 1000);
            });
        }
    };

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleArchiveClick = () => {
        if (uploadedFiles.length === 0) {
            alert("Please select files first.");
            return;
        }
        
        const payload = uploadedFiles.map(f => ({
            file: f.file,
            size: (f.displaySize / 1024 / 1024).toFixed(2) + ' MB'
        }));

        onArchive(payload, selectedDate, selectedTags);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(prev => prev.filter(t => t !== tag));
        } else {
            setSelectedTags(prev => [...prev, tag]);
        }
    };

    const changeMonth = (offset: number) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const openDatePicker = () => {
        setPickerYear(currentMonth.getFullYear());
        setShowDatePicker(true);
    };

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = new Date(pickerYear, monthIndex, 1);
        setCurrentMonth(newDate);
        setShowDatePicker(false);
    };

    const months = [
        "Jan", "Feb", "Mär", "Apr", "Mai", "Jun", 
        "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"
    ];

    const isAnyCompressing = uploadedFiles.some(f => f.isCompressing);
    const totalSize = uploadedFiles.reduce((acc, curr) => acc + curr.displaySize, 0);
    const originalTotalSize = uploadedFiles.reduce((acc, curr) => acc + curr.file.size, 0);
    const savedSpace = originalTotalSize - totalSize;

    return (
        <div className="min-h-screen bg-background text-gray-100 font-display animate-fade-in pb-36 overflow-y-auto transition-colors duration-300 relative">
            {/* Floating Back Button */}
            <div className="sticky top-0 z-50 p-6 pointer-events-none flex justify-between items-start">
                <button 
                    onClick={onBack} 
                    className="pointer-events-auto size-12 rounded-full bg-surface/80 backdrop-blur-xl shadow-2xl flex items-center justify-center text-white active:scale-95 transition-all hover:bg-surface hover:scale-105"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>
            </div>
            
            <main className="px-4 pt-2 space-y-8">
                {/* Large Title Section */}
                <div className="px-2">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} ${t.titleReview}` : t.titleNew}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {uploadedFiles.length > 0 
                            ? t.subtitleReview 
                            : t.subtitleNew}
                    </p>
                </div>

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf" 
                    className="hidden"
                    multiple
                />

                {/* File Drop / List Area */}
                {uploadedFiles.length === 0 ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-white/5 bg-surface/50 hover:bg-surface hover:border-primary/50 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group"
                    >
                        <div className="size-20 rounded-full bg-surface shadow-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                            <CloudUpload size={32} strokeWidth={1.5} />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-bold text-white mb-1">{t.selectFiles}</p>
                            <p className="text-sm text-gray-500">{t.dropText}</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t.titleReview}</h3>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="text-primary text-xs font-bold flex items-center gap-1 hover:brightness-110 px-3 py-1.5 rounded-full bg-primary/10"
                            >
                                <Plus size={12} strokeWidth={3} /> {t.addMore}
                            </button>
                        </div>

                        {/* Horizontal Scroll List */}
                        <div className="-mx-4 px-4 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                            {uploadedFiles.map((f) => (
                                <div key={f.id} className="relative group shrink-0 w-64 snap-center">
                                    <div className="bg-surface rounded-2xl p-1 shadow-lg relative overflow-hidden aspect-[3/4] flex flex-col">
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                                        
                                        {/* Remove Button */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                            className="absolute top-3 right-3 z-20 size-8 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>

                                        {/* Content Preview */}
                                        <div className="flex-1 bg-white/5 rounded-xl flex items-center justify-center relative">
                                            <FileText size={48} className="text-gray-600 opacity-50" />
                                            {f.isCompressing && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] rounded-xl">
                                                    <Loader2 size={32} className="text-primary animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                                            <p className="text-white font-bold text-sm line-clamp-1 mb-1">{f.file.name}</p>
                                            <div className="flex items-center gap-2">
                                                {f.isCompressing ? (
                                                    <span className="text-orange-400 text-[10px] font-bold flex items-center gap-1">
                                                        {t.compressing}
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                                            <CheckCircle size={10} /> {t.saved} {((f.file.size - f.displaySize)/1024).toFixed(0)}KB
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-[10px] mt-1">
                                                {(f.displaySize / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Stats */}
                        {savedSpace > 0 && !isAnyCompressing && (
                            <div className="mt-2 bg-gradient-to-r from-green-500/10 to-transparent border-l-2 border-green-500 p-3 rounded-r-xl">
                                <p className="text-xs text-green-400 font-medium flex items-center gap-2">
                                    <Zap size={14} fill="currentColor" />
                                    {t.totalSaved} <span className="font-bold text-white">{(savedSpace / 1024 / 1024).toFixed(2)} MB</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Unified Metadata Section */}
                <div className="bg-surface rounded-3xl p-6 shadow-xl">
                    {/* Date Picker */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.date}</h3>
                            <button 
                                onClick={openDatePicker}
                                className="text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                            >
                                {pickerYear} {t.change}
                            </button>
                        </div>
                        
                        <div className="bg-background rounded-2xl p-1 flex items-center justify-between mb-4">
                            <button onClick={() => changeMonth(-1)} className="size-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-white text-sm">
                                {currentMonth.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'), { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => changeMonth(1)} className="size-10 flex items-center justify-center hover:bg-white/5 rounded-xl text-gray-400">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 text-center gap-y-2">
                            {['S', 'M', 'D', 'M', 'D', 'F', 'S'].map((d, i) => (
                                <p key={i} className="text-gray-600 text-[10px] font-black">{d}</p>
                            ))}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`prev-${i}`} className="h-9"></div>
                            ))}
                            {Array.from({length: days}, (_, i) => i + 1).map(d => {
                                const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                                const isSelected = dateToCheck.toDateString() === selectedDate.toDateString();
                                return (
                                    <button 
                                        key={d}
                                        onClick={() => setSelectedDate(dateToCheck)}
                                        className={`h-9 w-9 mx-auto text-xs font-medium rounded-full flex items-center justify-center transition-all ${
                                            isSelected
                                            ? 'bg-secondary text-background shadow-lg shadow-secondary/30 font-bold scale-110' 
                                            : 'text-gray-300 hover:bg-white/10'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-px bg-white/5 w-full mb-8"></div>

                    {/* Tags */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t.categories}</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        selectedTags.includes(tag) 
                                        ? 'bg-primary text-background shadow-lg shadow-primary/20' 
                                        : 'bg-background text-gray-400 hover:bg-white/5'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
                <div className="max-w-md mx-auto">
                    <button 
                        onClick={handleArchiveClick}
                        disabled={uploadedFiles.length === 0 || isAnyCompressing}
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-black/50 transition-all active:scale-[0.98] ${
                            uploadedFiles.length > 0 && !isAnyCompressing
                            ? 'bg-white text-black hover:bg-gray-200'
                            : 'bg-surface text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isAnyCompressing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>{t.optimizing}</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={24} strokeWidth={2.5} />
                                <span>{uploadedFiles.length > 1 ? `${t.archive} (${uploadedFiles.length})` : t.archive}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDatePicker(false)}
                    ></div>
                    <div className="bg-surface w-full max-w-[340px] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">{t.yearMonth}</h3>
                            <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between mb-8 bg-background rounded-2xl p-2">
                            <button onClick={() => setPickerYear(prev => prev - 1)} className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft size={24} />
                            </button>
                            <span className="text-2xl font-bold text-white tracking-tight">{pickerYear}</span>
                            <button onClick={() => setPickerYear(prev => prev + 1)} className="p-3 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {months.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => handleMonthSelect(i)}
                                    className={`py-4 rounded-2xl text-sm font-bold transition-all ${
                                        currentMonth.getMonth() === i && currentMonth.getFullYear() === pickerYear
                                        ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/5'
                                    }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
