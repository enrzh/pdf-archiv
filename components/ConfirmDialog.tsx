import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    title?: string;
    message: React.ReactNode;
    confirmLabel: string;
    cancelLabel: string;
    tone?: 'danger' | 'primary';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    message,
    confirmLabel,
    cancelLabel,
    tone = 'danger',
    onConfirm,
    onCancel,
}) => {
    const confirmStyles =
        tone === 'danger'
            ? 'bg-red-500 text-white shadow-red-500/30 hover:brightness-110'
            : 'bg-secondary text-black shadow-secondary/20 hover:brightness-110';

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            ></div>
            <div className="relative bg-surface w-full max-w-sm rounded-[32px] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
                            <AlertTriangle size={20} />
                        </div>
                        {title && (
                            <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>
                        )}
                    </div>
                    <button
                        onClick={onCancel}
                        className="size-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="text-sm text-gray-300 leading-relaxed space-y-2">{message}</div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl bg-background text-gray-300 font-bold hover:bg-white/5 hover:text-white transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl font-black shadow-lg transition-colors ${confirmStyles}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
