import { BottomSheet } from "./BottomSheet";
import { Button } from "@/components/shared/Button";

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onReset: () => void;
  onApply: () => void;
  children: React.ReactNode;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  title,
  onReset,
  onApply,
  children,
}: FilterBottomSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onReset} className="flex-1">
            Reset
          </Button>
          <Button variant="primary" size="md" onClick={onApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      }
    >
      {children}
    </BottomSheet>
  );
}
