import { Modal } from "@/components/ui/Modal";

type PrintPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PrintPreviewModal({ isOpen, onClose }: PrintPreviewModalProps) {
  return (
    <Modal isOpen={isOpen} title="Print Preview" onClose={onClose}>
      <p>This is a mock print preview for the current report section.</p>
    </Modal>
  );
}
