import { ContentModal } from '../../../src/components/ContentModal';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { PresentationProvider } from '../../../src/contexts/PresentationContext';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: string;
}

export default function PreviewModal({ isOpen, onClose, data }: PreviewModalProps) {
  if (!isOpen) return null;

  // For all content types, use the universal ContentModal with draft status
  const draftData = { ...data, status: 'draft' };

  return (
    <ThemeProvider>
      <PresentationProvider>
        <ContentModal content={draftData} onClose={onClose} />
      </PresentationProvider>
    </ThemeProvider>
  );
}
