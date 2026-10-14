import React, { useState } from 'react';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  initialToken?: string;
  errorMessage?: string | null;
  onSave: (token: string) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialToken = '',
  errorMessage,
  onSave,
  onClose,
  canClose = false,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [validationError, setValidationError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTokenInput(initialToken);
      setValidationError(null);
    }
  }, [isOpen, initialToken]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setValidationError('認証IDを入力してください');
      return;
    }
    // api.md 仕様: 英数字10文字
    if (!/^[a-zA-Z0-9]{10}$/.test(trimmed)) {
      setValidationError('認証IDは英数字10文字で入力してください');
      return;
    }

    setValidationError(null);
    onSave(trimmed);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">🔑 スタッフ認証</h2>
          {canClose && onClose && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="閉じる"
            >
              ×
            </button>
          )}
        </div>

        <p className="modal-desc">
          配布された10文字の認証IDを入力してください。
        </p>

        {(validationError || errorMessage) && (
          <div className="modal-error">
            {validationError || errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            className="token-input"
            placeholder="例: aB3xK9mP2q"
            value={tokenInput}
            maxLength={10}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setValidationError(null);
            }}
          />

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              設定して接続
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
