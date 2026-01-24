import React, { useState, useEffect } from 'react';
import { DashboardScreen } from './screens/DashboardScreen';
import { ViewerScreen } from './screens/ViewerScreen';
import { UploadScreen } from './screens/UploadScreen';
import { ExportScreen } from './screens/ExportScreen';
import { FoldersScreen } from './screens/FoldersScreen';
import { StarredScreen } from './screens/StarredScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { Category, ScreenName, FileItem, Language } from './types';
import { deletePdfFile, loadAppState, saveAppState, savePdfFile } from './storage';

const CATEGORY_COLOR_PALETTE = ['#38bdf8', '#f97316', '#a855f7', '#22c55e', '#f43f5e', '#eab308', '#14b8a6'];

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Rechnung', color: '#38bdf8' },
  { name: 'Vertrag', color: '#f97316' },
  { name: 'Steuer', color: '#a855f7' },
  { name: 'Wichtig', color: '#f43f5e' },
  { name: 'Sonstiges', color: '#eab308' },
  { name: 'Privat', color: '#14b8a6' },
  { name: 'Arbeit', color: '#22c55e' },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('DE'); // Default German
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [previewDefaultEnabled, setPreviewDefaultEnabled] = useState(false);

  useEffect(() => {
    const storedLang = window.localStorage.getItem('language');
    if (storedLang === 'EN' || storedLang === 'DE' || storedLang === 'CN') {
      setLang(storedLang as Language);
    }
  }, []);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      return;
    }
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const storedPreviewDefault = window.localStorage.getItem('pdfPreviewDefault');
    if (storedPreviewDefault === 'on') {
      setPreviewDefaultEnabled(true);
    } else if (storedPreviewDefault === 'off') {
      setPreviewDefaultEnabled(false);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('language', lang);
  }, [lang]);

  useEffect(() => {
    window.localStorage.setItem('pdfPreviewDefault', previewDefaultEnabled ? 'on' : 'off');
  }, [previewDefaultEnabled]);

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      const storedState = await loadAppState();
      if (!isMounted) return;
      if (storedState) {
        setFiles(storedState.files);
        if (storedState.categories && storedState.categories.length > 0) {
          setCategories(storedState.categories);
        } else if (storedState.availableTags && storedState.availableTags.length > 0) {
          const upgradedCategories = storedState.availableTags.map((tag, index) => ({
            name: tag,
            color: CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length],
          }));
          setCategories(upgradedCategories);
        }
        if (storedState.language) {
          setLang(storedState.language);
        }
      }
      setIsStorageReady(true);
    };
    void loadState();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    void saveAppState(files, categories, lang);
  }, [files, categories, isStorageReady, lang]);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleArchive = async (filesData: { file: File, size: string }[], archiveDate: Date, tags: string[]) => {
    const newFiles: FileItem[] = [];
    for (const data of filesData) {
      const id = generateId();
      const uploadResult = await savePdfFile(id, data.file);
      newFiles.push({
        id,
        name: data.file.name,
        size: data.size,
        date: archiveDate,
        uploadedAt: new Date(),
        type: 'pdf',
        tags: tags,
        color: 'text-primary bg-primary/20', // Updated to use theme variable
        fileUrl: uploadResult.fileUrl,
        isSigned: false,
        isStarred: false,
        isRead: false, // Default is Unread (ungelesen)
        storagePath: uploadResult.storagePath,
      });
    }

    setFiles(prev => [...newFiles, ...prev]);
    setCurrentScreen('dashboard');
  };

  const handleDelete = (id: string) => {
    const fileToDelete = files.find(file => file.id === id);
    if (fileToDelete?.storagePath) {
      void deletePdfFile(fileToDelete.storagePath);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
      setCurrentScreen('dashboard');
    }
  };

  const handleNavigateToViewer = (id: string) => {
    setSelectedFileId(id);
    setCurrentScreen('viewer');
  };

  const handleToggleStar = (id: string) => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, isStarred: !f.isStarred } : f));
  };

  const handleToggleRead = (id: string) => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, isRead: !f.isRead } : f));
  };

  const handleUpdateFile = (id: string, updates: Partial<FileItem>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // Tag Management Handlers
  const handleAddTag = (category: Category) => {
    if (!category.name || categories.some((item) => item.name === category.name)) return;
    setCategories((prev) => [...prev, category]);
  };

  const handleEditTag = (oldTag: string, updatedCategory: Category) => {
    if (!updatedCategory.name) return;
    if (oldTag !== updatedCategory.name && categories.some((item) => item.name === updatedCategory.name)) return;

    setCategories((prev) =>
      prev.map((item) => (item.name === oldTag ? updatedCategory : item)),
    );

    if (oldTag !== updatedCategory.name) {
      setFiles((prev) =>
        prev.map((file) => ({
          ...file,
          tags: file.tags.map((tag) => (tag === oldTag ? updatedCategory.name : tag)),
        })),
      );
    }
  };

  const handleDeleteTag = (tag: string) => {
    setCategories((prev) => prev.filter((item) => item.name !== tag));
    // Optional: Remove tag from files? 
    // For now, let's keep it on files (historical data), just remove from available list for new adds.
    // If you want to remove from files:
    // setFiles(prev => prev.map(f => ({ ...f, tags: f.tags.filter(t => t !== tag) })));
  };


  const selectedFile = files.find(f => f.id === selectedFileId);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            files={files}
            lang={lang}
            categories={categories}
            onNavigate={(screen) => setCurrentScreen(screen)} 
            onFileSelect={handleNavigateToViewer}
            onExport={() => setCurrentScreen('export')}
            onDelete={handleDelete}
            onToggleRead={handleToggleRead}
          />
        );
      case 'folders':
        return (
            <FoldersScreen 
                files={files}
                lang={lang}
                categories={categories}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onFileSelect={handleNavigateToViewer}
            />
        );
      case 'starred':
        return (
            <StarredScreen 
                files={files}
                lang={lang}
                onNavigate={(screen) => setCurrentScreen(screen)}
                onFileSelect={handleNavigateToViewer}
            />
        );
      case 'settings':
        return (
            <SettingsScreen 
                lang={lang}
                setLang={setLang}
                previewDefaultEnabled={previewDefaultEnabled}
                onPreviewDefaultChange={setPreviewDefaultEnabled}
                categories={categories}
                onAddTag={handleAddTag}
                onEditTag={handleEditTag}
                onDeleteTag={handleDeleteTag}
                onNavigate={(screen) => setCurrentScreen(screen)}
            />
        );
      case 'viewer':
        return selectedFile ? (
          <ViewerScreen 
            file={selectedFile}
            lang={lang}
            categories={categories}
            previewDefaultEnabled={previewDefaultEnabled}
            onBack={() => setCurrentScreen('dashboard')} 
            onDelete={() => handleDelete(selectedFile.id)}
            onToggleStar={handleToggleStar}
            onToggleRead={handleToggleRead}
            onUpdate={handleUpdateFile}
          />
        ) : <DashboardScreen files={files} lang={lang} categories={categories} onNavigate={setCurrentScreen} onFileSelect={handleNavigateToViewer} onDelete={handleDelete} onExport={() => setCurrentScreen('export')} onToggleRead={handleToggleRead} />;
      case 'upload':
        return (
          <UploadScreen 
            lang={lang}
            categories={categories}
            onBack={() => setCurrentScreen('dashboard')} 
            onArchive={handleArchive}
          />
        );
      case 'export':
        return (
           <ExportScreen 
             files={files}
             lang={lang}
             onBack={() => {
                // Return to viewer if we have a selected file, else dashboard
                if (selectedFileId) setCurrentScreen('viewer');
                else setCurrentScreen('dashboard');
             }} 
            />
        );
      default:
        return <DashboardScreen files={files} lang={lang} categories={categories} onNavigate={(screen) => setCurrentScreen(screen)} onFileSelect={handleNavigateToViewer} onDelete={handleDelete} onExport={() => setCurrentScreen('export')} onToggleRead={handleToggleRead} />;
    }
  };

  return (
    <div className="bg-black min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md relative bg-background shadow-2xl min-h-screen overflow-hidden flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
}
