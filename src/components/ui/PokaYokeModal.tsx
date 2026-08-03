import { X, AlertTriangle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PokaYokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'info';
  requireConfirmationText?: string;
  onConfirmText?: (text: string) => void;
  autoFixAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function PokaYokeModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'warning',
  requireConfirmationText,
  onConfirmText,
  autoFixAction 
}: PokaYokeModalProps) {
  const [render, setRender] = useState(isOpen);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRender(true);
      setConfirmText('');
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) setRender(false);
  };

  if (!render) return null;

  const icons = {
    warning: <AlertTriangle className="w-12 h-12 text-amber-500 mb-4 mx-auto" />,
    error: <ShieldAlert className="w-12 h-12 text-rose-500 mb-4 mx-auto" />,
    info: <Info className="w-12 h-12 text-blue-500 mb-4 mx-auto" />,
  };

  const borders = {
    warning: 'border-amber-500/50 shadow-amber-500/20',
    error: 'border-rose-500/50 shadow-rose-500/20',
    info: 'border-blue-500/50 shadow-blue-500/20',
  };

  return (
    <div 
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={`modal-content p-6 text-center animate-spring border-t-4 ${borders[type]}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {icons[type]}
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {message}
        </p>

        <div className="flex flex-col gap-3 mt-4">
          {requireConfirmationText && (
            <div className="mb-2 text-left">
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Ketik "{requireConfirmationText}" untuk melanjutkan:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={requireConfirmationText}
                className="pos-input w-full font-mono text-center uppercase"
              />
            </div>
          )}

          {autoFixAction && (
            <button
              onClick={() => {
                autoFixAction.onClick();
                onClose();
              }}
              className="pos-btn-primary bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-orange-500/25 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {autoFixAction.label}
            </button>
          )}

          {requireConfirmationText && onConfirmText ? (
            <button
              onClick={() => {
                onConfirmText(confirmText);
                setConfirmText('');
              }}
              disabled={confirmText !== requireConfirmationText}
              className="pos-btn-danger w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Konfirmasi
            </button>
          ) : (
            <button
              onClick={onClose}
              className="pos-btn-secondary w-full"
            >
              Tutup & Paham
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
