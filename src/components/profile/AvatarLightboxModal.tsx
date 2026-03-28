"use client";

import { X } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useEffect } from "react";

interface AvatarLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    nome: string;
    avatar_url?: string | null;
    avatar_type?: string | null;
    uploaded_url?: string | null;
    character_id?: string | null;
    avatar_bg_color?: string | null;
  } | null;
}

export function AvatarLightboxModal({ isOpen, onClose, user }: AvatarLightboxModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex flex-col items-center animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute -top-14 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer outline-none"
        >
          <X strokeWidth={3} className="w-6 h-6" />
        </button>

        <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border-[6px] border-white/10 relative">
          <UserAvatar
            user={user}
            className="w-full h-full"
            iconSizeClassName="text-8xl font-black"
            style={{ borderRadius: "10%" }}
          />
        </div>

        <h3 className="mt-8 text-white font-display font-black text-2xl tracking-wide uppercase drop-shadow-md text-center max-w-[80vw] truncate">
          {user.nome || "Anônimo"}
        </h3>
      </div>
    </div>
  );
}
