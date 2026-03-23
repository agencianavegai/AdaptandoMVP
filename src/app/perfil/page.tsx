"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserProfile, logout } from "@/lib/actions/user";
import { Flame, Zap, Trophy, LogOut, Wind, Heart, Medal, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voluntario {
  id: string;
  nome: string;
  avatar_url: string | null;
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
      "bg-white rounded-2xl p-4 flex flex-col items-start border-2 border-slate-200 border-b-[6px]",
      borderColorClass
    )}>
      <div className={cn(`w-8 h-8 rounded-lg flex items-center justify-center mb-3`, colorClass)}>
        {icon}
      </div>
      <p className="font-display font-black text-2xl text-slate-800 leading-none mb-1">
        {value}
      </p>
      <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">
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
    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 border-2 border-slate-200 border-b-[6px] border-b-slate-300">
      {/* Left Icon */}
      <div className={cn(
        "w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center text-3xl",
        isUnlocked ? "bg-amber-100 border-2 border-amber-300" : "bg-slate-100 border-2 border-slate-200 grayscale opacity-60"
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h3 className={cn(
          "font-display font-black text-lg mb-0.5 truncate",
          isUnlocked ? "text-slate-800" : "text-slate-500"
        )}>
          {title}
        </h3>
        <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-snug mb-2">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex relative">
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
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center animate-pulse">
           <span className="text-5xl opacity-50">👤</span>
        </div>
        <h2 className="text-slate-400 font-display font-black text-2xl tracking-wide uppercase animate-pulse">
          Carregando...
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
    <div className="min-h-dvh bg-slate-50 pb-28 font-sans">
      
      {/* TOP BAR: Logout / Settings Icon */}
      <div className="px-6 pt-6 flex justify-end">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 border-2 border-slate-200 shadow-sm hover:text-red-500 hover:border-red-200 transition-colors active:scale-95"
          title="Sair da Conta"
        >
          <LogOut strokeWidth={2.5} className="w-5 h-5" />
        </button>
      </div>

      {/* HEADER: Player Altar */}
      <div className="flex flex-col items-center px-6 -mt-2">
        <div className="relative mb-4">
          {voluntario.avatar_url ? (
            <img
              src={voluntario.avatar_url}
              alt={voluntario.nome}
              className="w-32 h-32 rounded-full object-cover border-[6px] border-white shadow-xl bg-white"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center font-display font-black text-5xl text-white border-[6px] border-white shadow-xl">
               {initials}
            </div>
          )}
          {/* Subtle decoration */}
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md border-2 border-slate-100">
             <Trophy className="w-6 h-6 text-amber-500 fill-amber-100" />
          </div>
        </div>

        <h1 className="font-display font-black text-3xl text-slate-800 text-center uppercase tracking-wide">
          {voluntario.nome || "Anônimo"}
        </h1>
        <p className="text-slate-500 font-bold text-sm tracking-wide mt-1">
           Membro do Ádapo
        </p>
      </div>

      <div className="w-full h-px bg-slate-200 my-8" />

      {/* STATS GRID */}
      <div className="px-5 mb-10">
        <h2 className="font-display font-black text-xl text-slate-800 uppercase tracking-wide mb-4">
          Estatísticas
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-600 fill-orange-500" />}
            value={voluntario.ofensiva_atual}
            label="Chama Atual"
            colorClass="bg-orange-100"
            borderColorClass="border-b-orange-200"
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-amber-500 fill-amber-400" />}
            value={voluntario.melhor_ofensiva}
            label="Maior Chama"
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
        <h2 className="font-display font-black text-xl text-slate-800 uppercase tracking-wide mb-4">
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

    </div>
  );
}
