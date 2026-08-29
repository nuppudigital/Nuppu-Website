import { useEffect, useState } from 'react';
import { Delete, Shield, X } from 'lucide-react';

const DEMO_PIN = '1234';

interface ParentAccessModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParentAccessModal({ open, onClose, onSuccess }: ParentAccessModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!open) {
      setPin('');
      setError(false);
    }
  }, [open]);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === DEMO_PIN) {
        const timeout = setTimeout(() => {
          onSuccess();
          setPin('');
        }, 150);
        return () => clearTimeout(timeout);
      } else {
        setError(true);
        const timeout = setTimeout(() => {
          setError(false);
          setPin('');
        }, 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [pin, onSuccess]);

  if (!open) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) setPin((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#6E4FD1] to-[#C9BBF5] px-6 py-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold">Parent Access</h2>
            <p className="text-sm text-white/80">Enter your 4-digit PIN</p>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className={`flex justify-center gap-4 mb-8 ${error ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 ${
                  error
                    ? 'border-red-400 bg-red-400'
                    : pin.length > i
                      ? 'border-[#6E4FD1] bg-[#6E4FD1]'
                      : 'border-gray-300 bg-transparent'
                }`}
              />
            ))}
          </div>

          {error && <p className="text-center text-sm text-red-500 mb-4">Incorrect PIN, try again</p>}

          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-xl font-semibold text-[#35322B]"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleDigit('0')}
              className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-xl font-semibold text-[#35322B]"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all flex items-center justify-center text-[#35322B]"
              aria-label="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Demo PIN: 1234</p>
        </div>
      </div>
    </div>
  );
}

export function ParentAccessButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-6 right-6 w-14 h-14 bg-[#6E4FD1] hover:bg-[#5E3FC0] rounded-full shadow-xl flex items-center justify-center z-40 active:scale-95 transition-all"
      aria-label="Parent access"
    >
      <Shield className="w-6 h-6 text-white" />
    </button>
  );
}
