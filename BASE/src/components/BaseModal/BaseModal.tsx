import type { ReactNode, MouseEvent } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  disableBackdropClose?: boolean;
  closeOnEsc?: boolean;
};

const BaseModal = ({
  isOpen,
  onClose,
  children,
  className = '',
  disableBackdropClose = false,
  closeOnEsc = true,
}: BaseModalProps) => {
  const portalElement = document.getElementById('portal-element');

  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !portalElement) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (disableBackdropClose) return;

    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`max-h-[90vh] max-w-lg w-full rounded-lg bg-white p-6 shadow-xl ${className}`}
      >
        {children}
      </div>
    </div>,
    portalElement
  );
};

export default BaseModal;
