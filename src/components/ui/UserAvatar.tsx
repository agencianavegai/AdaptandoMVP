"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface VoluntarioAvatar {
  nome: string;
  avatar_url?: string | null;
  avatar_type?: string | null;
  uploaded_url?: string | null;
  character_id?: string | null;
  avatar_bg_color?: string | null;
}

interface UserAvatarProps {
  user: VoluntarioAvatar;
  className?: string; // e.g., "w-12 h-12 md:w-16 md:h-16"
  iconSizeClassName?: string; // e.g., "text-xl md:text-2xl"
  style?: React.CSSProperties; // custom inline styles
}

export function UserAvatar({ user, className, iconSizeClassName, style }: UserAvatarProps) {
  const { nome, avatar_type, uploaded_url, character_id, avatar_bg_color, avatar_url } = user;
  
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  
  if (avatar_type === "upload" && uploaded_url) {
    return (
      <div 
        className={cn("relative overflow-hidden shrink-0 rounded-2xl bg-brand/10 border-2 border-brand/20", className)}
        style={style}
      >
        <Image 
          src={uploaded_url} 
          alt={nome} 
          fill 
          sizes="(max-width: 768px) 100px, 200px"
          className="object-cover" 
        />
      </div>
    );
  }

  if (avatar_type === "character" && character_id) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    return (
      <div 
        className={cn("relative overflow-hidden shrink-0 rounded-2xl border-2 border-brand/20", className)}
        style={{ backgroundColor: avatar_bg_color || "#FF5733", ...style }}
      >
        <Image 
          src={`${supabaseUrl}/storage/v1/object/public/personagens/${character_id}`} 
          alt={nome} 
          fill 
          sizes="(max-width: 768px) 100px, 200px"
          className="object-cover" 
        />
      </div>
    );
  }

  if (avatar_url) {
     return (
      <div 
        className={cn("relative overflow-hidden shrink-0 rounded-2xl bg-brand/10 border-2 border-brand/20", className)}
        style={style}
      >
        <Image 
          src={avatar_url} 
          alt={nome} 
          fill 
          sizes="(max-width: 768px) 100px, 200px"
          className="object-cover" 
        />
      </div>
    );
  }

  // Fallback to initials
  return (
    <div 
      className={cn(
        "shrink-0 rounded-2xl bg-brand flex items-center justify-center font-bold text-white shadow-inner", 
        className
      )}
      style={style}
    >
      <span className={iconSizeClassName}>{getInitials(nome || "?")}</span>
    </div>
  );
}
