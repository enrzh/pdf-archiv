export type ScreenName = 'dashboard' | 'viewer' | 'upload' | 'export' | 'folders' | 'starred' | 'settings';
export type Language = 'EN' | 'DE' | 'CN';

export interface Category {
    name: string;
    color: string;
}

export interface FileItem {
    id: string;
    name: string;
    size: string;
    date: Date; // The archived date
    uploadedAt: Date; // The actual upload timestamp
    type: 'pdf';
    tags: string[];
    isSigned?: boolean;
    isStarred?: boolean;
    isRead: boolean; // New property for Read/Unread status
    color: string;
    fileUrl: string; // Blob URL for the PDF
    storagePath?: string; // Local filesystem path in data folder
}

export interface CalendarDay {
    day: string;
    date: number;
    fullDate: Date;
    isActive?: boolean;
}
