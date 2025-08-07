import { useState, useEffect } from "react";
import { X, ArrowDown } from "lucide-react";

interface OnboardingHintProps {
  show: boolean;
  onDismiss: () => void;
}

export default function OnboardingHint({
  show,
  onDismiss,
}: OnboardingHintProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Delay showing the hint to allow the trigger node to render
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm relative animate-bounce">
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white text-blue-500 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-3">
          <ArrowDown className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-medium text-sm">Great start!</div>
            <div className="text-xs text-blue-100">
              Hover over your trigger to add jobs and steps
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
