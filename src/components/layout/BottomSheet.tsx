import { useEffect, useRef, useState, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<"closed" | "opening" | "open" | "closing">(
    "closed",
  );
  const startY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Sync body overflow as a pure side effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    // cleanup handled by close logic
  }, [isOpen]);

  // Track isOpen transitions via ref + separate effect to schedule state updates
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen === isOpenRef.current) return;
    const wasOpen = isOpenRef.current;
    isOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      // Use requestAnimationFrame to avoid synchronous setState in effect
      requestAnimationFrame(() => {
        setDragY(0);
        setPhase("opening");
      });
      const timer = setTimeout(() => setPhase("open"), 300);
      return () => clearTimeout(timer);
    }

    if (!isOpen && wasOpen) {
      requestAnimationFrame(() => {
        setPhase((prev) => {
          if (prev === "open" || prev === "opening") {
            const sheetHeight = sheetRef.current?.offsetHeight || 400;
            setDragY(sheetHeight);
            setTimeout(() => {
              setPhase("closed");
              setDragY(0);
              document.body.style.overflow = "";
            }, 250);
            return "closing";
          }
          return prev;
        });
      });
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDragStart = useCallback((clientY: number) => {
    startY.current = clientY;
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (!isDragging) return;
      const delta = clientY - startY.current;
      setDragY(Math.max(0, delta));
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const sheetHeight = sheetRef.current?.offsetHeight || 400;
    if (dragY > sheetHeight * 0.5 || dragY > 200) {
      setPhase("closing");
      setDragY(sheetHeight);
      setTimeout(() => {
        onClose();
        setPhase("closed");
        setDragY(0);
        document.body.style.overflow = "";
      }, 250);
    } else {
      setDragY(0);
    }
  }, [isDragging, dragY, onClose]);

  const handleTouchStart = (e: React.TouchEvent) =>
    handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) =>
    handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const handleMouseUp = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleAnimatedClose = () => {
    if (phase === "closing") return;
    setPhase("closing");
    const sheetHeight = sheetRef.current?.offsetHeight || 400;
    setDragY(sheetHeight);
    setTimeout(() => {
      onClose();
      setPhase("closed");
      setDragY(0);
      document.body.style.overflow = "";
    }, 250);
  };

  if (phase === "closed") return null;

  const isClosing = phase === "closing";
  const isOpening = phase === "opening";
  const footerHeight = footer ? 72 : 0;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: isClosing ? 0 : Math.max(0, 1 - dragY / 400) }}
        onClick={handleAnimatedClose}
      />

      {/* Sheet Container */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-background-secondary rounded-t-3xl border-t border-white/10 w-full ${
          isOpening ? "animate-slide-up" : ""
        }`}
        style={{
          maxHeight: "85vh",
          transform: `translateY(${dragY}px)`,
          transition: isDragging ? "none" : "transform 0.25s ease-out",
        }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="px-4 pb-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <button
              onClick={handleAnimatedClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div
          className="overflow-y-auto overflow-x-hidden p-4 pb-6"
          style={{
            maxHeight: `calc(85vh - ${title ? 120 : 56}px - ${footerHeight}px)`,
          }}
        >
          {children}
        </div>

        {/* Fixed Footer */}
        {footer && (
          <div className="px-4 py-4 border-t border-white/10 bg-background-secondary">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
