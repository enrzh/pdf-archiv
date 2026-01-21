import React from 'react';
import { Info, X } from 'lucide-react';

interface PopupNoticeProps {
    message: string;
    onClose: () => void;
}

export const PopupNotice: React.FC<PopupNoticeProps> = ({ message, onClose }) => {
    return (
        <div className="fixed inset-x-0 top-6 z-[60] px-4">
            <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                <div className="mt-0.5 size-9 shrink-0 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <Info size={18} />
                </div>
                <div className="flex-1 text-sm font-medium text-white leading-relaxed">
                    {message}
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Close notification"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};
