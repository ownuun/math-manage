'use client';

import { useEffect, useCallback } from 'react';

export function useModalHistory(isOpen: boolean, onClose: () => void) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    history.pushState({ modal: true }, '');

    const handlePopState = () => {
      handleClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, handleClose]);
}
