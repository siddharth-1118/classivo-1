import { X } from "lucide-react";
import React, { useEffect } from "react";

interface TallyModalProps {
  open: boolean;
  onClose: () => void;
  formUrl: string;
}

const TALLY_EMBED_URL = "https://tally.so/widgets/embed.js";

export const TallyModal: React.FC<TallyModalProps> = ({
  open,
  onClose,
  formUrl,
}) => {
  useEffect(() => {
    if (open && !document.getElementById("tally-embed-script")) {
      const script = document.createElement("script");
      script.src = TALLY_EMBED_URL;
      script.async = true;
      script.id = "tally-embed-script";
      document.body.appendChild(script);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed z-[9999] inset-0 w-screen h-screen bg-black/70 flex items-center justify-center">
      <div className="relative w-[90vw] h-[90vh] bg-white rounded-[12px] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute border rounded-full right-3 top-3 p-2 bg-black "
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <iframe
          data-tally-src={formUrl + "?transparentBackground=1"}
          width="100%"
          height="100%"
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
          title="Tally Form"
        />
      </div>
    </div>
  );
};
