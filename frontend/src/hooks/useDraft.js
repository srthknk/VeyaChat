import { useState, useCallback, useRef, useEffect } from 'react';

export const useDraft = (onSendDraft, debounceMs = 300) => {
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimerRef = useRef(null);
  const draftStartedRef = useRef(false);

  const handleDraftChange = useCallback(
    (text) => {
      if (text.length > 500) return; // Max draft length

      setDraft(text);

      if (!draftStartedRef.current && text.length > 0) {
        draftStartedRef.current = true;
        setIsTyping(true);
        onSendDraft?.({ type: 'draftStart', text });
      }

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        if (text.length > 0) {
          onSendDraft?.({ type: 'draftUpdate', text });
        }
      }, debounceMs);
    },
    [onSendDraft, debounceMs]
  );

  const clearDraftInput = useCallback(() => {
    setDraft('');
    setIsTyping(false);
    draftStartedRef.current = false;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSendDraft?.({ type: 'draftClear' });
  }, [onSendDraft]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      onSendDraft?.({ type: 'draftStop' });
    }
  }, [isTyping, onSendDraft]);

  return {
    draft,
    isTyping,
    handleDraftChange,
    clearDraftInput,
    stopTyping,
  };
};
