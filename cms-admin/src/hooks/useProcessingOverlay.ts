import { useCallback, useEffect, useRef, useState } from 'react';

type ProcessingOptions = {
  message?: string;
  durationMs?: number;
};

export function useProcessingOverlay(defaultMessage = 'Processing...') {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showProcessing = useCallback(
    (options?: ProcessingOptions | string, durationOverride?: number) => {
      const resolvedOptions =
        typeof options === 'string'
          ? { message: options, durationMs: durationOverride }
          : options || {};

      const durationMs = resolvedOptions.durationMs ?? 2000;
      const nextMessage = resolvedOptions.message || defaultMessage;

      clearTimer();
      setMessage(nextMessage);
      setIsProcessing(true);

      timeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
        setMessage(null);
        timeoutRef.current = null;
      }, durationMs);
    },
    [clearTimer, defaultMessage]
  );

  const hideProcessing = useCallback(() => {
    clearTimer();
    setIsProcessing(false);
    setMessage(null);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return {
    isProcessing,
    message,
    showProcessing,
    hideProcessing
  };
}
