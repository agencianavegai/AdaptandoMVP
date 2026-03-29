"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, logout } from "@/lib/actions/user";
import { uploadRealPhoto } from "@/lib/actions/avatar";
import { Flame, Zap, Trophy, LogOut, Wind, Heart, Medal, Star, Share2, Check, Settings, Image as ImageIcon, PaintBucket, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import SettingsHubModal from "@/components/ui/SettingsHubModal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AdapeteCreatorModal } from "@/components/profile/AdapeteCreatorModal";
import { AvatarLightboxModal } from "@/components/profile/AvatarLightboxModal";

interface Voluntario {
  id: string;
  nome: string;
  avatar_url?: string | null;
  avatar_type?: string | null;
  uploaded_url?: string | null;
  character_id?: string | null;
  avatar_bg_color?: string | null;
  metros_linha: number;
  vidas_atuais: number;
  ofensiva_atual: number;
  melhor_ofensiva: number;
}

// ----------------------------------------------------------------------
// COMPONENTS
// ----------------------------------------------------------------------

function StatCard({ 
  icon, 
  value, 
  label, 
  colorClass, 
  borderColorClass 
}: { 
  icon: React.ReactNode; 
  value: string | number; 
  label: string; 
  colorClass: string;
  borderColorClass: string;
}) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-start border-2 border-slate-200 dark:border-slate-700 border-b-[6px]",
      borderColorClass
    )}>
      <div className={cn(`w-8 h-8 rounded-lg flex items-center justify-center mb-3`, colorClass)}>
        {icon}
      </div>
      <p className="font-display font-black text-2xl text-slate-800 dark:text-slate-100 leading-none mb-1">
        {value}
      </p>
      <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function AchievementCard({ 
  icon, 
  title, 
  description, 
  progress, 
  maxProgress, 
  isUnlocked 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  progress: number;
  maxProgress: number;
  isUnlocked: boolean;
}) {
  const percentage = Math.min(100, Math.max(0, (progress / maxProgress) * 100));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-4 border-2 border-slate-200 dark:border-slate-700 border-b-[6px] border-b-slate-300 dark:border-b-slate-600">
      {/* Left Icon */}
      <div className={cn(
        "w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-3xl",
        isUnlocked ? "bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700" : "bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 grayscale opacity-60"
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className={cn(
          "font-display font-black text-lg mb-0.5 truncate",
          isUnlocked ? "text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
        )}>
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-2 leading-snug mb-2">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-700 h-3.5 rounded-full overflow-hidden flex relative">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isUnlocked ? "bg-amber-400" : "bg-[var(--color-brand)]"
            )}
            style={{ width: `${percentage}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-600 tracking-wider">
            {progress} / {maxProgress}
          </span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN PAGE
// ----------------------------------------------------------------------

export default function PerfilPage() {
  const [voluntario, setVoluntario] = useState<Voluntario | null>(null);
  const [email, setEmail] = useState("");
  const [mundosConcluidos, setMundosConcluidos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdapeteModal, setShowAdapeteModal] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      const result = await uploadRealPhoto(formData);
      if (result.success && voluntario) {
        // Optimistic UI update or simply let useEffect fetch again
        // Here we just let Next.js revalidation do its job but visually we can immediately trigger a hard refresh or state update:
        setVoluntario({ ...voluntario, avatar_type: "upload", uploaded_url: result.url });
      } else {
        alert(result.error || "Erro ao fazer upload");
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getUserProfile();
        setVoluntario(data.voluntario);
        setEmail(data.email || "");
        setMundosConcluidos(data.mundosConcluidos);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch {
      setLoggingOut(false);
    }
  }

  const handleShare = async () => {
    if (!voluntario) return;
    
    const text = `Estou a ${voluntario.ofensiva_atual} dias me Adaptando e já conquistei ${voluntario.metros_linha} metros de linha no Instituto Ádapo! Vem dar linha pra sonhar também! 🪁🔥 #Adaptando #InstitutoAdapo`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Meu Perfil no Instituto Ádapo",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.log("Compartilhamento cancelado ou não suportado", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
          <span className="text-5xl" aria-hidden="true">👤</span>
        </div>
        <h2 className="text-white font-display font-black text-2xl tracking-wide uppercase" style={{ color: 'var(--color-storm-dark)' }}>
          Carregando Perfil...
        </h2>
      </div>
    );
  }

  if (!voluntario) return null;

  const initials = (voluntario.nome || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-[#0f1117] pb-36 font-sans transition-colors duration-300">
      
      <SettingsHubModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      <AdapeteCreatorModal 
        isOpen={showAdapeteModal} 
        onClose={() => setShowAdapeteModal(false)} 
        onSaved={(charId, color) => {
          if (voluntario) {
            setVoluntario({
              ...voluntario, 
              avatar_type: "character", 
              character_id: charId, 
              avatar_bg_color: color 
            });
          }
        }}
        currentBgColor={voluntario.avatar_bg_color || undefined}
        currentCharacterId={voluntario.character_id || undefined}
      />

      <AvatarLightboxModal 
        isOpen={showLightbox} 
        onClose={() => setShowLightbox(false)} 
        user={voluntario} 
      />

      {/* TOP BAR: Logout / Settings Icon */}
      <div className="px-6 pt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors active:scale-95"
          title="Configurações"
        >
          <Settings strokeWidth={2.5} className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 transition-colors active:scale-95"
          title="Sair da Conta"
        >
          <LogOut strokeWidth={2.5} className="w-5 h-5" />
        </button>
      </div>

      {/* HEADER: Player Altar */}
      <div className="flex flex-col items-center px-6 -mt-2">
        <div 
          className="relative mb-4 cursor-pointer group"
          onClick={() => setShowLightbox(true)}
          role="button"
          tabIndex={0}
        >
          <UserAvatar 
            user={voluntario}
            className="w-32 h-32 border-[6px] border-white shadow-xl min-[400px]:w-36 min-[400px]:h-36 group-hover:scale-105 transition-transform"
            iconSizeClassName="text-5xl font-black"
            style={{ borderRadius: "50%" }}
          />

          {isUploading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-full flex items-center justify-center z-10 border-[6px] border-transparent">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" strokeWidth={3} />
            </div>
          )}

          {/* Subtle decoration */}
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-md border-2 border-slate-100 dark:border-slate-700 z-20">
             <Trophy className="w-6 h-6 text-amber-500 fill-amber-100" />
          </div>
        </div>

        <h1 className="font-display font-black text-3xl text-slate-800 dark:text-slate-100 text-center uppercase tracking-wide">
          {voluntario.nome || "Anônimo"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide mt-1 mb-5">
           Membro do Ádapo
        </p>

        {/* Change Avatar CTAs */}
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-[260px]">
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex-1 min-h-[44px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-black text-sm uppercase tracking-wider rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-100 active:scale-95 flex items-center justify-center gap-2 outline-none transition-all disabled:opacity-50 disabled:scale-100"
          >
            <ImageIcon strokeWidth={2.5} className="w-4 h-4" />
            <span className="hidden min-[360px]:inline">Foto</span>
          </button>
          
          <button
            onClick={() => setShowAdapeteModal(true)}
            disabled={isUploading}
            className="flex-1 min-h-[44px] bg-[var(--color-brand)] border-2 border-[var(--color-brand)] shadow-[0_4px_0_0_var(--color-brand-shadow)] active:translate-y-1 active:shadow-none hover:brightness-110 text-white font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 outline-none transition-all disabled:opacity-50"
          >
            <PaintBucket strokeWidth={2.5} className="w-4 h-4" />
            <span className="hidden min-[360px]:inline">Adapete</span>
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-8" />

      {/* STATS GRID */}
      <div className="px-5 mb-10">
        <h2 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
          Estatísticas
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-600 fill-orange-500" />}
            value={voluntario.ofensiva_atual}
            label="Ofensiva Atual"
            colorClass="bg-orange-100"
            borderColorClass="border-b-orange-200"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-amber-500 fill-amber-400" />}
            value={voluntario.melhor_ofensiva}
            label="Maior Ofensiva"
            colorClass="bg-amber-100"
            borderColorClass="border-b-amber-200"
          />
          <StatCard
            icon={<Wind className="w-5 h-5 text-blue-500 fill-blue-400" />}
            value={`${voluntario.metros_linha}m`}
            label="Metros Acumulados"
            colorClass="bg-blue-100"
            borderColorClass="border-b-blue-200"
          />
          <StatCard
            icon={<Heart className="w-5 h-5 text-red-500 fill-red-400" />}
            value={voluntario.vidas_atuais}
            label="Vidas Iniciais"
            colorClass="bg-red-100"
            borderColorClass="border-b-red-200"
          />
        </div>
      </div>

      {/* ACHIEVEMENTS (BADGES) */}
      <div className="px-5 mb-8">
        <h2 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
          Minhas Pipas
        </h2>
        <div className="flex flex-col gap-4">
          
          <AchievementCard
            icon="🪁"
            title="Primeiro Voo"
            description="Complete sua primeira fase no mundo 1."
            progress={voluntario.metros_linha > 0 ? 1 : 0}
            maxProgress={1}
            isUnlocked={voluntario.metros_linha > 0}
          />
          
          <AchievementCard
            icon="💨"
            title="Mestre dos Ventos"
            description="Acumule incríveis 500 metros de linha nas trilhas."
            progress={voluntario.metros_linha}
            maxProgress={500}
            isUnlocked={voluntario.metros_linha >= 500}
          />

          <AchievementCard
            icon="🌍"
            title="Explorador Celeste"
            description="Conclua 3 mundos diferentes na sua jornada."
            progress={mundosConcluidos}
            maxProgress={3}
            isUnlocked={mundosConcluidos >= 3}
          />

        </div>
      </div>

      {/* FAB: Social Share Button */}
      <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-center w-full max-w-md mx-auto">
        <button
          onClick={handleShare}
          className="w-full min-h-[56px] bg-gradient-to-r from-[#ff7f06] to-pink-500 hover:from-orange-500 hover:to-pink-600 active:scale-[0.98] text-white font-display font-black text-xl rounded-2xl shadow-[0_8px_20px_-4px_rgba(255,127,6,0.6)] border border-white/20 flex items-center justify-center gap-3 transition-all duration-300"
        >
          {copied ? (
            <>
              <Check className="w-6 h-6 animate-in zoom-in" strokeWidth={3} />
              Copiado!
            </>
          ) : (
            <>
              <Share2 className="w-6 h-6" strokeWidth={2.5} />
              Mostrar ao Mundo 🪁
            </>
          )}
        </button>
      </div>

    </div>
  );
}
