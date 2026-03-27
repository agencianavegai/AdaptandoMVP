"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRanking } from "@/lib/actions/user";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankUser {
  id: string;
  nome: string;
  avatar_url: string | null;
  metros_linha: number;
  is_adapete?: boolean;
}

type TabFilter = "adapete" | "global";

function UserAvatar({ 
  nome, 
  avatar_url, 
  sizeClass, 
  borderClass 
}: { 
  nome: string; 
  avatar_url: string | null; 
  sizeClass: string;
  borderClass: string; 
}) {
  const initials = (nome || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={nome}
        className={cn("rounded-full object-cover border-4 shadow-md bg-white", sizeClass, borderClass)}
      />
    );
  }

  return (
    <div className={cn(
      "rounded-full bg-slate-200 flex items-center justify-center font-display font-black text-slate-500 border-4 shadow-md",
      sizeClass,
      borderClass
    )}>
      {initials}
    </div>
  );
}

function PodiumCard({ user, position, isMe }: { user: RankUser; position: 1 | 2 | 3; isMe: boolean }) {
  const configs = {
    1: {
      height: "h-40",
      bgColor: "bg-amber-400",
      borderColor: "border-amber-300",
      avatarBorder: "border-amber-400",
      avatarSize: "w-24 h-24 text-3xl",
      order: "order-2",
      badgeColor: "bg-amber-500",
      numberColor: "text-amber-100",
      textColor: "text-amber-900",
      crown: <Crown className="w-8 h-8 text-amber-500 fill-amber-300 absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-sm" />,
    },
    2: {
      height: "h-28",
      bgColor: "bg-slate-300",
      borderColor: "border-slate-200",
      avatarBorder: "border-slate-300",
      avatarSize: "w-20 h-20 text-2xl",
      order: "order-1",
      badgeColor: "bg-slate-400",
      numberColor: "text-slate-100",
      textColor: "text-slate-700",
      crown: null,
    },
    3: {
      height: "h-24",
      bgColor: "bg-amber-700",
      borderColor: "border-amber-600",
      avatarBorder: "border-amber-700",
      avatarSize: "w-20 h-20 text-2xl",
      order: "order-3",
      badgeColor: "bg-amber-800",
      numberColor: "text-amber-100",
      textColor: "text-amber-100",
      crown: null,
    },
  };

  const config = configs[position];

  return (
    <div className={cn("flex flex-col items-center", config.order, position === 1 ? "z-10" : "")}>
      
      {/* Avatar Box */}
      <div className="relative mb-3 flex flex-col items-center">
        {config.crown}
        <UserAvatar 
          nome={user.nome} 
          avatar_url={user.avatar_url} 
          sizeClass={config.avatarSize} 
          borderClass={config.avatarBorder}
        />
        
        {/* Number Badge */}
        <div className={cn(
          "absolute -bottom-3 w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm border-2 border-white shadow-sm",
          config.badgeColor,
          config.numberColor
        )}>
          {position}
        </div>
      </div>

      {/* Name */}
      <p className={cn(
        "font-display font-black text-sm text-center max-w-[90px] truncate mt-2", 
        isMe ? "text-[var(--color-brand)]" : "text-white/80"
      )}>
        {user.nome?.split(" ")[0] || "Anônimo"}
      </p>

      {/* Podium Block */}
      <div className={cn(
        "w-[88px] rounded-t-xl mt-3 flex flex-col items-center justify-start pt-3 border-x-2 border-t-2 shadow-inner",
        config.height,
        config.bgColor,
        config.borderColor
      )}>
        <p className={cn("font-display font-black text-sm", config.textColor)}>
          {user.metros_linha}
        </p>
        <p className={cn("text-[10px] font-bold uppercase opacity-80", config.textColor)}>
          metros
        </p>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [myId, setMyId] = useState("");
  const [myPosition, setMyPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("adapete");
  const router = useRouter();

  async function loadRanking(filter: TabFilter) {
    setLoading(true);
    try {
      const data = await getRanking(filter);
      setRanking(data.ranking);
      setMyId(data.myId);
      setMyPosition(data.myPosition);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRanking(activeTab);
  }, [activeTab]);

  function handleTabChange(tab: TabFilter) {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  }

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[var(--color-storm-dark)] to-[var(--color-storm-mid)] pb-28 font-sans">
      
      {/* Header */}
      <div className="pt-12 pb-4 text-center px-4">
        <h1 className="font-display font-black text-4xl text-white uppercase tracking-tight">
          Os Maiores Voos
        </h1>
        <p className="text-white/60 font-bold text-sm mt-2 tracking-wide">
          O Pódio dos Pipeiros Mais Altos
        </p>
      </div>

      {/* Tab Switcher (Pill Style) */}
      <div className="flex justify-center px-6 mb-6">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-1 border border-white/20 shadow-lg w-full max-w-xs">
          <button
            onClick={() => handleTabChange("adapete")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-full font-display font-black text-sm tracking-wide uppercase transition-all duration-300",
              activeTab === "adapete"
                ? "bg-[var(--color-brand)] text-white shadow-md"
                : "text-white/60 hover:text-white/80"
            )}
          >
            Liga Ádapo
          </button>
          <button
            onClick={() => handleTabChange("global")}
            className={cn(
              "flex-1 py-2.5 px-4 rounded-full font-display font-black text-sm tracking-wide uppercase transition-all duration-300",
              activeTab === "global"
                ? "bg-sky-500 text-white shadow-md"
                : "text-white/60 hover:text-white/80"
            )}
          >
            Global
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-6 py-20">
          <div className="w-24 h-24 bg-[var(--color-brand)] rounded-[var(--radius-kite)] flex items-center justify-center animate-float shadow-[0_8px_0_0_var(--color-brand-shadow)]">
            <span className="text-5xl" aria-hidden="true">🏆</span>
          </div>
          <h2 className="text-white font-display font-black text-2xl tracking-wide uppercase">
            Carregando Ranking...
          </h2>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length >= 3 ? (
            <div className="flex justify-center items-end gap-1 sm:gap-3 px-2 mb-10 mt-6">
              <PodiumCard user={top3[1]} position={2} isMe={top3[1].id === myId} />
              <PodiumCard user={top3[0]} position={1} isMe={top3[0].id === myId} />
              <PodiumCard user={top3[2]} position={3} isMe={top3[2].id === myId} />
            </div>
          ) : top3.length > 0 ? (
            <div className="flex justify-center items-end gap-2 px-4 mb-10 mt-6">
              {top3.map((u, i) => (
                <PodiumCard key={u.id} user={u} position={(i + 1) as 1 | 2 | 3} isMe={u.id === myId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 font-display font-bold text-lg">
                {activeTab === "adapete"
                  ? "Nenhum Adapete encontrado ainda."
                  : "Nenhum voluntário encontrado ainda."}
              </p>
            </div>
          )}

          {/* Competitors List (4th onwards) */}
          {rest.length > 0 && (
            <div className="px-5 flex flex-col gap-3">
              {rest.map((user, index) => {
                const position = index + 4;
                const isMe = user.id === myId;
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl p-4 border-2 border-b-[6px] transition-all",
                      isMe
                        ? "bg-[var(--color-brand)]/10 border-[var(--color-brand)]/40 border-b-[var(--color-brand-shadow)]/40 shadow-sm"
                        : "bg-white border-slate-200 border-b-slate-300"
                    )}
                  >
                    {/* Position */}
                    <span className={cn(
                      "font-display font-black text-lg w-6 text-center",
                      isMe ? "text-[var(--color-brand)]" : "text-slate-400"
                    )}>
                      {position}
                    </span>

                    {/* Avatar */}
                    <UserAvatar 
                      nome={user.nome} 
                      avatar_url={user.avatar_url} 
                      sizeClass="w-12 h-12 text-sm" 
                      borderClass={isMe ? "border-[var(--color-brand)]/60" : "border-slate-200"}
                    />

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-display font-black text-base truncate", 
                        isMe ? "text-[var(--color-brand)]" : "text-slate-700"
                      )}>
                        {user.nome || "Anônimo"}
                      </p>
                    </div>

                    {/* Metros */}
                    <div className="text-right">
                      <p className={cn(
                        "font-display font-black text-xl leading-none",
                        isMe ? "text-[var(--color-brand)]" : "text-slate-800"
                      )}>
                        {user.metros_linha}
                      </p>
                      <p className={cn(
                        "text-[10px] font-bold uppercase tracking-wide mt-0.5",
                        isMe ? "text-[var(--color-brand-light)]" : "text-slate-400"
                      )}>
                        metros
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
