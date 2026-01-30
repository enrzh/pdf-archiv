import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MoreVertical, FileText, Plus, X, Check, Calendar, ChevronLeft, ChevronRight, Trash2, Eye, EyeOff, Download } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PopupNotice } from '../components/PopupNotice';
import { Category, FileItem, ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface DashboardScreenProps {
    files: FileItem[];
    onNavigate: (screen: ScreenName) => void;
    onFileSelect: (id: string) => void;
    onExport: (id?: string) => void;
    onDelete: (id: string) => void;
    onToggleRead: (id: string) => void;
    lang: Language;
    categories: Category[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ files, onNavigate, onFileSelect, onExport, onDelete, onToggleRead, lang, categories }) => {
    const t = TRANSLATIONS[lang].dashboard;
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showRangeDownload, setShowRangeDownload] = useState(false);
    const [rangeStartDate, setRangeStartDate] = useState('');
    const [rangeEndDate, setRangeEndDate] = useState('');
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);
    const [readStatusFilter, setReadStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
    const categoryMap = useMemo(() => new Map(categories.map((category) => [category.name, category])), [categories]);
    
    // Date Filter State
    const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(null);
    const [pickerDate, setPickerDate] = useState(new Date());

    // Menu State
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const toggleTagFilter = (tag: string) => {
        if (activeTagFilters.includes(tag)) {
            setActiveTagFilters(prev => prev.filter(t => t !== tag));
        } else {
            setActiveTagFilters(prev => [...prev, tag]);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon...
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(pickerDate);
    const prevMonthDays = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), 0).getDate();

    const changePickerMonth = (offset: number) => {
        setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + offset, 1));
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
        setSelectedDateFilter(newDate);
        setShowDatePicker(false);
    };

    const clearDateFilter = () => {
        setSelectedDateFilter(null);
        setShowDatePicker(false);
    };

    const filesInRange = useMemo(() => {
        const start = rangeStartDate ? new Date(`${rangeStartDate}T00:00:00`) : null;
        const end = rangeEndDate ? new Date(`${rangeEndDate}T23:59:59`) : null;

        return files.filter((file) => {
            const fileDate = file.date;
            if (start && fileDate < start) return false;
            if (end && fileDate > end) return false;
            return true;
        });
    }, [files, rangeStartDate, rangeEndDate]);

    const handleRangeDownload = () => {
        const downloadableFiles = filesInRange.filter((file) => file.fileUrl);

        if (downloadableFiles.length === 0) {
            setPopupMessage(t.downloadRangeEmpty);
            return;
        }

        downloadableFiles.forEach((file) => {
            const link = document.createElement('a');
            link.href = file.fileUrl;
            link.download = file.name || 'document.pdf';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    };

    const handleFileDownload = (file: FileItem) => {
        if (!file.fileUrl) {
            setPopupMessage(t.downloadUnavailable);
            return;
        }

        const link = document.createElement('a');
        link.href = file.fileUrl;
        link.download = file.name || 'document.pdf';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const filteredFiles = files.filter(file => {
        // 1. Text Search
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // 2. Tag Filters
        let matchesTags = true;
        if (activeTagFilters.length > 0) {
            matchesTags = file.tags.some(tag => activeTagFilters.includes(tag));
        }

        // 3. Date Filter (Day/Month/Year)
        let matchesDate = true;
        if (selectedDateFilter) {
            const fileDate = new Date(file.date);
            matchesDate = fileDate.getDate() === selectedDateFilter.getDate() &&
                          fileDate.getMonth() === selectedDateFilter.getMonth() &&
                          fileDate.getFullYear() === selectedDateFilter.getFullYear();
        }

        // 4. Read Status Filter
        let matchesStatus = true;
        if (readStatusFilter === 'read') matchesStatus = file.isRead;
        if (readStatusFilter === 'unread') matchesStatus = !file.isRead;

        return matchesSearch && matchesTags && matchesDate && matchesStatus;
    });

    // Sort by date descending
    const sortedFiles = [...filteredFiles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const fileGroups = useMemo(() => {
        const groups: { date: Date; items: FileItem[] }[] = [];
        
        sortedFiles.forEach(file => {
            const fileDateStr = new Date(file.date).toDateString();
            const lastGroup = groups[groups.length - 1];
            
            if (lastGroup && new Date(lastGroup.date).toDateString() === fileDateStr) {
                lastGroup.items.push(file);
            } else {
                groups.push({ date: new Date(file.date), items: [file] });
            }
        });
        
        return groups;
    }, [sortedFiles]);

    const getDateHeader = (date: Date) => {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return t.today;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return t.yesterday;
        } else {
            return date.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'), { weekday: 'short', month: 'long', day: 'numeric' });
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setPendingDeleteId(id);
        setActiveMenuId(null);
    };

    const handleReadToggleClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        onToggleRead(id);
        setActiveMenuId(null);
    };

    return (
        <div className="bg-background text-gray-100 lg:pb-10 animate-fade-in flex flex-col transition-colors duration-300 relative">
            
            {/* Backdrop for closing menu */}
            {activeMenuId && (
                <div className="fixed inset-0 z-20 cursor-default" onClick={() => setActiveMenuId(null)}></div>
            )}

            {popupMessage && (
                <PopupNotice message={popupMessage} onClose={() => setPopupMessage(null)} />
            )}

            {/* Search (Sticky Header) */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl px-4 pt-8 pb-4 transition-colors duration-300">
                <div className="relative group flex items-center gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        </div>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 bg-surface rounded-2xl text-sm text-gray-100 shadow-sm focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all placeholder:text-gray-500 focus:border-primary/50" 
                            placeholder={t.searchPlaceholder} 
                        />
                    </div>
                    
                    {/* Date Picker Toggle */}
                    <button 
                        onClick={() => {
                            setPickerDate(selectedDateFilter || new Date());
                            setShowDatePicker(true);
                        }}
                        className={`size-[50px] flex items-center justify-center rounded-2xl transition-all shadow-sm ${selectedDateFilter ? 'bg-primary text-black shadow-glow' : 'bg-surface text-gray-400 hover:text-white hover:bg-card'}`}
                    >
                         <div className="relative">
                            <Calendar size={20} strokeWidth={selectedDateFilter ? 2.5 : 2} />
                            {selectedDateFilter && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-primary"></span>
                                </span>
                            )}
                        </div>
                    </button>

                    {/* Date Range Download */}
                    <button
                        onClick={() => setShowRangeDownload(true)}
                        className="size-[50px] flex items-center justify-center rounded-2xl transition-all shadow-sm bg-surface text-gray-400 hover:text-white hover:bg-card"
                    >
                        <Download size={20} strokeWidth={2} />
                    </button>

                    {/* Filter Toggle */}
                    <button 
                        onClick={() => setShowFilters(true)}
                        className={`size-[50px] flex items-center justify-center rounded-2xl transition-all shadow-sm ${activeTagFilters.length > 0 || readStatusFilter !== 'all' ? 'bg-primary text-black shadow-glow' : 'bg-surface text-gray-400 hover:text-white hover:bg-card'}`}
                    >
                        <div className="relative">
                            <SlidersHorizontal size={20} strokeWidth={activeTagFilters.length > 0 || readStatusFilter !== 'all' ? 2.5 : 2} />
                            {(activeTagFilters.length > 0 || readStatusFilter !== 'all') && (
                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white border-2 border-primary"></span>
                                </span>
                            )}
                        </div>
                    </button>
                </div>
            </div>

            {/* Uploads List */}
            <div className="px-4 mt-4 lg:pb-10">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                        {selectedDateFilter ? selectedDateFilter.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'), { day: 'numeric', month: 'long', year: 'numeric' }) : (activeTagFilters.length > 0 ? t.filteredResults : t.allUploads)}
                        {selectedDateFilter && (
                            <button onClick={clearDateFilter} className="bg-white/10 hover:bg-white/20 rounded-full p-1 transition-colors">
                                <X size={12} />
                            </button>
                        )}
                    </h3>
                    <div className="flex items-center gap-2">
                         {readStatusFilter !== 'all' && (
                            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-wide border border-purple-500/20">
                                {readStatusFilter === 'read' ? t.read : t.unread}
                            </span>
                        )}
                        {selectedDateFilter && (
                             <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wide border border-blue-500/20">
                                {t.dateFilter}
                            </span>
                        )}
                         {activeTagFilters.length > 0 && (
                            <span className="px-2.5 py-1 rounded-lg bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wide border border-secondary/20">
                                {activeTagFilters.length} tags
                            </span>
                        )}
                        <span className="px-2.5 py-1 rounded-lg bg-surface text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                            {filteredFiles.length} files
                        </span>
                    </div>
                </div>
                
                {sortedFiles.length > 0 ? (
                    <div className="space-y-8">
                        {fileGroups.map((group) => (
                            <div key={group.date.toDateString()} className="animate-fade-in">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 pl-1">
                                    {getDateHeader(group.date)}
                                </h4>
                                <div className="space-y-3">
                                    {group.items.map((file) => (
                                        <div key={file.id} onClick={() => onFileSelect(file.id)} className={`group cursor-pointer flex items-center gap-4 bg-surface p-3 pr-2 rounded-[20px] shadow-sm active:scale-[0.99] transition-all hover:bg-card relative ${activeMenuId === file.id ? 'z-30' : 'z-10'}`}>
                                            <div className="relative">
                                                <div className={`size-14 shrink-0 rounded-2xl flex items-center justify-center ${file.color} shadow-inner`}>
                                                    <FileText size={28} strokeWidth={1.5} />
                                                </div>
                                                {/* Unread Indicator */}
                                                {!file.isRead && (
                                                    <div className="absolute -top-1 -right-1 size-3.5 bg-blue-500 border-2 border-surface rounded-full shadow-lg shadow-blue-500/20 z-10"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <p className={`text-[15px] text-gray-100 truncate leading-tight mb-1 ${!file.isRead ? 'font-black' : 'font-bold'}`}>{file.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-gray-500 bg-background px-2 py-0.5 rounded">{file.size}</span>
                                                    <span className="text-[11px] font-medium text-gray-500">
                                                        {file.date.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'))}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Tags (Mini) */}
                                            {file.tags.length > 0 && (
                                                <div className="flex -space-x-2 mr-1">
                                                        {file.tags.slice(0, 2).map((tag, i) => {
                                                            const category = categoryMap.get(tag);
                                                            const label = tag.slice(0, 4).toUpperCase();
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className="size-6 rounded-full flex items-center justify-center text-[7px] font-black z-0 shadow-sm text-white"
                                                                    style={{ backgroundColor: category?.color ?? '#1f2937' }}
                                                                >
                                                                    {label}
                                                                </div>
                                                            );
                                                        })}
                                                     {file.tags.length > 2 && (
                                                         <div className="size-6 rounded-full bg-card flex items-center justify-center text-[8px] text-gray-500 font-bold z-10 shadow-sm">
                                                            +{file.tags.length - 2}
                                                        </div>
                                                     )}
                                                </div>
                                            )}
                                            
                                            {/* Menu Button & Popup */}
                                            <div className="relative h-10 w-10 flex items-center justify-center">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenuId(activeMenuId === file.id ? null : file.id);
                                                    }}
                                                    className="size-8 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {activeMenuId === file.id && (
                                                    <div className="absolute right-2 top-8 w-48 bg-card/95 backdrop-blur-xl rounded-2xl shadow-surface overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                                        <div className="p-1.5 space-y-0.5">
                                                            <button 
                                                                onClick={(e) => handleReadToggleClick(e, file.id)}
                                                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-200 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                                            >
                                                                {file.isRead ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-blue-400" />}
                                                                {file.isRead ? t.markUnread : t.markRead}
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFileDownload(file);
                                                                    setActiveMenuId(null);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-gray-200 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                                                            >
                                                                <Download size={16} className="text-secondary" />
                                                                {t.download}
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleDeleteClick(e, file.id)}
                                                                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                                {t.delete}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <div className="size-20 rounded-full bg-surface flex items-center justify-center mb-4 shadow-inner">
                             <FileText size={32} className="text-gray-600" />
                        </div>
                        <p className="text-base text-gray-400 font-bold">{t.noFiles}</p>
                        {(activeTagFilters.length > 0 || searchTerm || selectedDateFilter || readStatusFilter !== 'all') && (
                            <button 
                                onClick={() => {
                                    setSearchTerm('');
                                    setActiveTagFilters([]);
                                    setSelectedDateFilter(null);
                                    setReadStatusFilter('all');
                                }}
                                className="mt-4 text-primary text-sm font-bold hover:underline"
                            >
                                {t.clearFilters}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="h-4 lg:hidden"></div>

            {pendingDeleteId && (
                <ConfirmDialog
                    title={t.delete}
                    message={t.deleteConfirm}
                    confirmLabel={t.delete}
                    cancelLabel={t.cancel}
                    tone="danger"
                    onCancel={() => setPendingDeleteId(null)}
                    onConfirm={() => {
                        onDelete(pendingDeleteId);
                        setPendingDeleteId(null);
                    }}
                />
            )}

            {/* Date Picker Modal */}
            {showDatePicker && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDatePicker(false)}
                    ></div>
                    <div className="bg-surface w-full max-w-[340px] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{t.selectDate}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">{t.filterByDate}</p>
                            </div>
                            <button onClick={() => setShowDatePicker(false)} className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-6 bg-background rounded-2xl p-1.5">
                            <button onClick={() => changePickerMonth(-1)} className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-base font-bold text-white tracking-wide">
                                {pickerDate.toLocaleDateString(lang === 'DE' ? 'de-DE' : (lang === 'CN' ? 'zh-CN' : 'en-US'), { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => changePickerMonth(1)} className="p-2.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 text-center mb-8 gap-y-2">
                             {['S', 'M', 'D', 'M', 'D', 'F', 'S'].map((d, i) => (
                                <p key={i} className="text-gray-600 text-[10px] font-black uppercase">{d}</p>
                            ))}

                             {/* Previous month empty days */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`prev-${i}`} className="h-9"></div>
                            ))}

                            {/* Current month days */}
                            {Array.from({length: days}, (_, i) => i + 1).map(d => {
                                const dateToCheck = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), d);
                                const isSelected = selectedDateFilter && 
                                                   dateToCheck.getDate() === selectedDateFilter.getDate() &&
                                                   dateToCheck.getMonth() === selectedDateFilter.getMonth() &&
                                                   dateToCheck.getFullYear() === selectedDateFilter.getFullYear();
                                
                                return (
                                    <button 
                                        key={d}
                                        onClick={() => handleDateSelect(d)}
                                        className={`size-9 mx-auto text-sm font-medium rounded-full transition-all flex items-center justify-center relative ${
                                            isSelected
                                            ? 'bg-primary text-black shadow-lg shadow-primary/30 font-bold scale-110' 
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>

                        <button 
                            onClick={clearDateFilter}
                            className="w-full py-3.5 rounded-xl bg-background text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors text-sm"
                        >
                            {t.resetFilter}
                        </button>
                    </div>
                </div>
            )}

            {/* Range Download Modal */}
            {showRangeDownload && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 animate-in fade-in duration-200">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowRangeDownload(false)}
                    ></div>
                    <div className="bg-surface w-full max-w-[360px] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{t.downloadRangeTitle}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">
                                    {t.downloadRangeHint.replace('{count}', String(filesInRange.length))}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowRangeDownload(false)}
                                className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.fromDate}</label>
                                <input
                                    type="date"
                                    value={rangeStartDate}
                                    onChange={(event) => setRangeStartDate(event.target.value)}
                                    className="mt-2 w-full rounded-xl bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/70"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{t.toDate}</label>
                                <input
                                    type="date"
                                    value={rangeEndDate}
                                    onChange={(event) => setRangeEndDate(event.target.value)}
                                    className="mt-2 w-full rounded-xl bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-secondary/70"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleRangeDownload}
                            className="w-full rounded-2xl bg-secondary text-black py-3 text-sm font-extrabold shadow-xl shadow-secondary/20 transition-all hover:brightness-110 active:scale-[0.99]"
                        >
                            {t.downloadRangeCta}
                        </button>
                    </div>
                </div>
            )}

            {/* Tag Filter Modal (Beautiful Sheet) */}
            {showFilters && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:px-4 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowFilters(false)}
                    ></div>

                    <div className="bg-surface w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 duration-300">
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-4 pb-2">
                            <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
                        </div>

                        <div className="px-6 pb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <div className="size-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center border border-primary/20">
                                     <SlidersHorizontal size={20} className="text-primary" />
                                </div>
                                {t.filters}
                            </h3>
                            <button 
                                onClick={() => setShowFilters(false)} 
                                className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="p-6 pt-2 space-y-8 overflow-y-auto">
                             {/* Read/Unread Filter */}
                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block ml-1">{t.status}</label>
                                <div className="flex p-1 bg-background rounded-xl">
                                    <button 
                                        onClick={() => setReadStatusFilter('all')}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${readStatusFilter === 'all' ? 'bg-primary text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {t.allUploads}
                                    </button>
                                    <button 
                                        onClick={() => setReadStatusFilter('unread')}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${readStatusFilter === 'unread' ? 'bg-primary text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {t.unread}
                                    </button>
                                     <button 
                                        onClick={() => setReadStatusFilter('read')}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${readStatusFilter === 'read' ? 'bg-primary text-black shadow-md' : 'text-gray-500 hover:text-white'}`}
                                    >
                                        {t.read}
                                    </button>
                                </div>
                             </div>

                             <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block ml-1">{t.categories}</label>
                                <div className="flex flex-wrap gap-2.5">
                                    {categories.map((category) => (
                                        <button 
                                            key={category.name}
                                            onClick={() => toggleTagFilter(category.name)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                                                activeTagFilters.includes(category.name) 
                                                ? 'bg-secondary text-black shadow-lg shadow-secondary/20' 
                                                : 'bg-background text-gray-400 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="size-2.5 rounded-full" style={{ backgroundColor: category.color }}></span>
                                            {activeTagFilters.includes(category.name) && <Check size={14} strokeWidth={3} />}
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div className="pt-2 flex gap-3">
                                <button 
                                     onClick={() => {
                                         setActiveTagFilters([]);
                                         setReadStatusFilter('all');
                                     }}
                                     className="flex-1 py-4 rounded-2xl bg-background text-gray-400 font-bold hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {t.reset}
                                </button>
                                <button 
                                     onClick={() => setShowFilters(false)}
                                     className="flex-[2] py-4 rounded-2xl bg-primary text-black font-black shadow-xl shadow-primary/20 transition-transform active:scale-[0.98]"
                                >
                                    {t.showResults} ({filteredFiles.length})
                                </button>
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
