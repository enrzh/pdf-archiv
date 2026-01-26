import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Globe, Tag, Plus, Edit2, Trash2, X, Check, Monitor, MonitorOff } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Category, ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface SettingsScreenProps {
    onNavigate: (screen: ScreenName) => void;
    lang: Language;
    setLang: (lang: Language) => void;
    previewDefaultEnabled: boolean;
    onPreviewDefaultChange: (enabled: boolean) => void;
    categories: Category[];
    onAddTag: (category: Category) => void;
    onEditTag: (oldTag: string, category: Category) => void;
    onDeleteTag: (tag: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    onNavigate, 
    lang, 
    setLang, 
    previewDefaultEnabled,
    onPreviewDefaultChange,
    categories, 
    onAddTag, 
    onEditTag, 
    onDeleteTag 
}) => {
    const [isDark, setIsDark] = useState(true);
    const [editingTag, setEditingTag] = useState<{ original: string, current: string, color: string } | null>(null);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('#38bdf8');
    const [pendingDeleteTag, setPendingDeleteTag] = useState<string | null>(null);
    const t = TRANSLATIONS[lang].settings;

    useEffect(() => {
        const storedTheme = window.localStorage.getItem('theme');
        if (storedTheme === 'light') {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
            return;
        }
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDark(true);
            return;
        }
        // Check initial state from DOM
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        window.localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
        if (newIsDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLanguageChange = (language: Language) => {
        setLang(language);
        window.localStorage.setItem('language', language);
    };

    const handlePreviewDefaultToggle = () => {
        onPreviewDefaultChange(!previewDefaultEnabled);
    };

    const handleSaveNewTag = () => {
        if (newTagName.trim()) {
            onAddTag({ name: newTagName.trim(), color: newTagColor });
            setNewTagName('');
            setNewTagColor('#38bdf8');
            setIsAddingTag(false);
        }
    };

    const handleUpdateTag = () => {
        if (editingTag && editingTag.current.trim()) {
            onEditTag(editingTag.original, { name: editingTag.current.trim(), color: editingTag.color });
            setEditingTag(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-gray-100 pb-24 lg:pb-10 animate-fade-in flex flex-col h-full transition-colors duration-300 relative">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl px-4 pt-8 pb-4 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="size-10 flex items-center justify-center">
                        <Settings size={28} className="text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">{t.title}</h1>
                        <p className="text-xs text-gray-500 font-medium">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                 {/* Dark Mode Card */}
                 <div className="bg-surface rounded-2xl overflow-hidden shadow-sm">
                    <button 
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-500'}`}>
                                {isDark ? <Moon size={20} /> : <Sun size={20} />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{t.darkMode}</p>
                                <p className="text-[10px] text-gray-500">{isDark ? t.on : t.off}</p>
                            </div>
                        </div>
                        
                        {/* Toggle Switch UI */}
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-400'}`}>
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </button>
                 </div>

                 {/* PDF Preview Default Card */}
                 <div className="bg-surface rounded-2xl overflow-hidden shadow-sm">
                    <button 
                        onClick={handlePreviewDefaultToggle}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-gray-500/10 text-gray-300 flex items-center justify-center transition-colors">
                                {previewDefaultEnabled ? <Monitor size={20} /> : <MonitorOff size={20} />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-white">{t.previewDefault}</p>
                                <p className="text-[10px] text-gray-500">{t.previewDefaultSub}</p>
                            </div>
                        </div>
                        
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${previewDefaultEnabled ? 'bg-primary' : 'bg-gray-400'}`}>
                            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${previewDefaultEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </button>
                 </div>

                 {/* Language Selection Card */}
                 <div className="bg-surface rounded-2xl overflow-hidden p-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center transition-colors">
                            <Globe size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">{t.language}</p>
                            <p className="text-[10px] text-gray-500">{t.languageSub}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                        {(['DE', 'EN', 'CN'] as Language[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => handleLanguageChange(l)}
                                className={`h-10 rounded-xl text-xs font-bold transition-all ${
                                    lang === l 
                                    ? 'bg-white text-black shadow-lg' 
                                    : 'bg-background text-gray-400 hover:bg-white/5'
                                }`}
                            >
                                {l === 'DE' ? 'Deutsch' : l === 'EN' ? 'English' : '中文'}
                            </button>
                        ))}
                    </div>
                 </div>

                 {/* Category Management Card */}
                 <div className="bg-surface rounded-2xl overflow-hidden p-4 shadow-sm">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center transition-colors">
                                <Tag size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">{t.manageCategories}</p>
                                <p className="text-[10px] text-gray-500">{t.categoriesSub}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsAddingTag(true)}
                            className="size-8 rounded-full bg-background flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                     </div>

                     <div className="space-y-2">
                         {categories.map((category) => (
                             <div key={category.name} className="flex items-center justify-between p-3 bg-background rounded-xl">
                                 <div className="flex items-center gap-2">
                                     <span className="size-3 rounded-full" style={{ backgroundColor: category.color }}></span>
                                     <span className="text-sm font-medium text-gray-300">{category.name}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => setEditingTag({ original: category.name, current: category.name, color: category.color })}
                                        className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                         <Edit2 size={14} />
                                     </button>
                                     <button 
                                        onClick={() => {
                                            setPendingDeleteTag(category.name);
                                        }}
                                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                         <Trash2 size={14} />
                                     </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
            </div>

            <BottomNav activeTab="settings" onNavigate={onNavigate} lang={lang} />

            {pendingDeleteTag && (
                <ConfirmDialog
                    title={t.delete}
                    message={t.deleteCategoryConfirm}
                    confirmLabel={t.delete}
                    cancelLabel={t.cancel}
                    tone="danger"
                    onCancel={() => setPendingDeleteTag(null)}
                    onConfirm={() => {
                        onDeleteTag(pendingDeleteTag);
                        setPendingDeleteTag(null);
                    }}
                />
            )}

            {/* Add/Edit Modal */}
            {(isAddingTag || editingTag) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => {
                            setIsAddingTag(false);
                            setEditingTag(null);
                        }}
                    ></div>
                    <div className="bg-surface w-full max-w-[340px] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {isAddingTag ? t.addCategory : t.editCategory}
                            </h3>
                            <button 
                                onClick={() => {
                                    setIsAddingTag(false);
                                    setEditingTag(null);
                                }} 
                                className="text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 block ml-1">{t.categoryName}</label>
                            <input 
                                type="text"
                                autoFocus
                                value={isAddingTag ? newTagName : editingTag?.current || ''}
                                onChange={(e) => {
                                    if (isAddingTag) setNewTagName(e.target.value);
                                    else if (editingTag) setEditingTag({ ...editingTag, current: e.target.value });
                                }}
                                className="w-full bg-background rounded-2xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary/50 font-bold"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 block ml-1">{t.categoryColor}</label>
                            <div className="flex items-center gap-3 bg-background rounded-2xl p-4">
                                <input
                                    type="color"
                                    value={isAddingTag ? newTagColor : editingTag?.color || '#38bdf8'}
                                    onChange={(e) => {
                                        if (isAddingTag) setNewTagColor(e.target.value);
                                        else if (editingTag) setEditingTag({ ...editingTag, color: e.target.value });
                                    }}
                                    className="h-10 w-12 rounded-md border-0 bg-transparent"
                                />
                                <span className="text-xs font-semibold text-gray-400">
                                    {isAddingTag ? newTagColor : editingTag?.color}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsAddingTag(false);
                                    setEditingTag(null);
                                }}
                                className="flex-1 py-3.5 rounded-xl bg-background text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {t.cancel}
                            </button>
                            <button 
                                onClick={isAddingTag ? handleSaveNewTag : handleUpdateTag}
                                className="flex-1 py-3.5 rounded-xl bg-primary text-black font-black hover:brightness-110 transition-colors shadow-glow"
                            >
                                {t.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
