import React, { useState, useMemo } from 'react';
import { Folder, FileText, MoreVertical, ChevronLeft, Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { Category, FileItem, ScreenName, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface FoldersScreenProps {
    files: FileItem[];
    onNavigate: (screen: ScreenName) => void;
    onFileSelect: (id: string) => void;
    lang: Language;
    categories: Category[];
}

export const FoldersScreen: React.FC<FoldersScreenProps> = ({ files, onNavigate, onFileSelect, lang, categories }) => {
    const t = TRANSLATIONS[lang].folders;
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadFolder = async () => {
        if (!selectedFolder || filteredFiles.length === 0) return;

        setIsDownloading(true);
        try {
            const zip = new JSZip();

            // Fetch all files in parallel
            const fetchPromises = filteredFiles.map(async (file) => {
                if (!file.fileUrl) return;
                try {
                    const response = await fetch(file.fileUrl);
                    if (!response.ok) throw new Error(`Failed to fetch ${file.name}`);
                    const blob = await response.blob();

                    let fileName = file.name;
                    if (!fileName.toLowerCase().endsWith('.pdf')) {
                        fileName += '.pdf';
                    }

                    // Collision avoidance
                    let finalName = fileName;
                    let counter = 1;
                    while (zip.file(finalName)) {
                        const dotIndex = fileName.lastIndexOf('.');
                        if (dotIndex !== -1) {
                            finalName = `${fileName.substring(0, dotIndex)} (${counter})${fileName.substring(dotIndex)}`;
                        } else {
                            finalName = `${fileName} (${counter})`;
                        }
                        counter++;
                    }

                    zip.file(finalName, blob);
                } catch (err) {
                    console.error(err);
                }
            });

            await Promise.all(fetchPromises);

            const content = await zip.generateAsync({ type: 'blob' });

            // Trigger download
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selectedFolder}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error zipping folder:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    // Aggregate tags to create folders
    const folders = useMemo(() => {
        const tagMap = new Map<string, number>();
        
        // Initialize default folders from categories
        categories.forEach((category) => tagMap.set(category.name, 0));

        // Count files per tag
        files.forEach(file => {
            if (file.tags.length === 0) {
                const count = tagMap.get('Unsorted') || 0;
                tagMap.set('Unsorted', count + 1);
            } else {
                file.tags.forEach(tag => {
                    // Only count if tag is in categories (or 'Unsorted' logic)
                    // If file has a tag that was deleted from categories, you might want to show it or ignore it.
                    // Here we show it if it exists in the map (which we seeded with categories)
                    if (tagMap.has(tag)) {
                         const count = tagMap.get(tag) || 0;
                         tagMap.set(tag, count + 1);
                    } else {
                        // Optional: Handle tags on files that are no longer in "categories"
                        // For now, we only show folders for currently available tags
                    }
                });
            }
        });

        // Convert to array and filter out empty default folders if you want, 
        // or keep them to show available categories. We'll keep them.
        return Array.from(tagMap.entries()).map(([name, count]) => ({
            name,
            count
        })).sort((a, b) => {
            // Priority sort: Files first, then name
            if (a.count > 0 && b.count === 0) return -1;
            if (a.count === 0 && b.count > 0) return 1;
            return a.name.localeCompare(b.name);
        });
    }, [files, categories]);

    const filteredFiles = selectedFolder 
        ? files.filter(f => selectedFolder === 'Unsorted' ? f.tags.length === 0 : f.tags.includes(selectedFolder))
        : [];

    return (
        <div className="bg-background text-gray-100 lg:pb-10 animate-fade-in flex flex-col h-full transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md px-4 pt-8 pb-4 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    {selectedFolder ? (
                        <button 
                            onClick={() => setSelectedFolder(null)}
                            className="size-10 rounded-full bg-surface flex items-center justify-center text-gray-400 hover:text-white"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    ) : (
                         <div className="size-10 flex items-center justify-center">
                            <Folder size={28} className="text-primary" />
                         </div>
                    )}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            {selectedFolder || t.title}
                        </h1>
                        <p className="text-xs text-gray-500 font-medium">
                            {selectedFolder ? `${filteredFiles.length} ${t.documents}` : `${folders.length} ${t.categories}`}
                        </p>
                    </div>
                    {selectedFolder && filteredFiles.length > 0 && (
                        <button
                            onClick={handleDownloadFolder}
                            disabled={isDownloading}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-glow active:scale-95 ${isDownloading ? 'bg-surface text-gray-500' : 'bg-primary text-black hover:brightness-110'}`}
                        >
                            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} strokeWidth={2.5} />}
                            <span className="hidden sm:inline">{t.downloadFolder}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 overflow-y-auto lg:pb-10">
                {selectedFolder ? (
                    /* Folder Contents View */
                    <div className="space-y-4 animate-fade-in">
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
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
                                    </div>
                                    <button className="size-8 flex items-center justify-center text-gray-600 hover:text-white transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <Folder size={48} className="text-gray-600 mb-2" />
                                <p className="text-sm text-gray-500 font-medium">{t.empty}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Folders Grid View */
                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                        {folders.map((folder) => (
                            <button 
                                key={folder.name}
                                onClick={() => setSelectedFolder(folder.name)}
                                className="bg-surface p-4 rounded-3xl flex flex-col gap-4 text-left hover:bg-white/5 transition-colors active:scale-[0.98]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center ${folder.count > 0 ? 'bg-primary/10 text-primary' : 'bg-white/5 text-gray-500'}`}>
                                        <Folder size={24} fill="currentColor" className="opacity-80" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 bg-black/20 px-2 py-1 rounded-full">{folder.count}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-100">{folder.name === 'Unsorted' ? t.unsorted : folder.name}</h3>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{t.updatedRecently}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="h-4 lg:hidden"></div>
        </div>
    );
};
