"use client";

import { useEffect, useState } from "react";
import { Flame, Wind, Heart, Clock, X, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  voluntario: {
    nome: string;
    avatar_url: string | null;
    metros_linha: number;
    vidas_atuais: number;
    ofensiva_atual: number;
  } | null;
  nextRechargeSeconds?: number;
  currentFocus?: string;
}

function MiniTimer({ seconds }: { seconds: number }) {
  const [s, setS] = useState(seconds);

  useEffect(() => {
    setS(seconds);
  }, [seconds]);

  useEffect(() => {
    if (s <= 0) return;
    const interval = setInterval(() => {
      setS((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [s]);

  if (s <= 0) return <span>Recarregando...</span>;

  const m = Math.floor(s / 60);
  const sec = s % 60;
  return (
    <span className="flex items-center gap-0.5 text-[var(--color-info)] ml-1">
      <Clock className="w-2.5 h-2.5" />
      {String(m).padStart(2, "0")}:{String(sec).padStart(2, "0")}
    </span>
  );
}

export default function TopBar({ voluntario, nextRechargeSeconds = 0, currentFocus }: TopBarProps) {
  const [showLivesModal, setShowLivesModal] = useState(false);
  const [showXpModal, setShowXpModal] = useState(false);
  const [showChamaModal, setShowChamaModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const nome = voluntario?.nome || "Cria";
  const initials = nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const vidas = voluntario?.vidas_atuais ?? 5;
  const metros = voluntario?.metros_linha ?? 0;
  const ofensiva = voluntario?.ofensiva_atual ?? 0;

  const handleShare = async () => {
    const focusText = currentFocus ? ` Meu foco atual é dominar: ${currentFocus}.` : "";
    const text = `Estou a ${ofensiva} dias me Adaptando no Instituto Ádapo!${focusText} Vem dar linha pra sonhar também! 🪁🔥 #Adaptdando #InstitutoAdapo`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Minha Ofensiva no Instituto Ádapo",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err) {
      console.log("Compartilhamento cancelado ou falhou", err);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 w-full bg-black/20 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">

          {/* AVATAR + Name */}
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform group text-left outline-none"
          >
            <div className="relative">
              {voluntario?.avatar_url ? (
                <img
                  src={voluntario.avatar_url}
                  alt={nome}
                  className="w-12 h-12 rounded-2xl border-4 border-white object-cover shadow-lg bg-orange-200"
                  style={{ borderRadius: "var(--radius-kite)" }}
                />
              ) : (
                <div
                  className="w-12 h-12 border-4 border-white shadow-lg flex items-center justify-center text-sm font-black text-white bg-[var(--color-brand)]"
                  style={{ borderRadius: "var(--radius-kite)" }}
                >
                  {initials}
                </div>
              )}
            </div>

            <span className="text-lg font-display font-black text-white drop-shadow-md hidden min-[380px]:block truncate max-w-[90px] group-hover:text-[var(--color-brand-light)] transition-colors">
              {nome.split(" ")[0]}
            </span>
          </button>

          {/* METRICS */}
          <div className="flex items-center gap-2">
            {/* Papéis de Seda (Vidas) — Clickable to open Modal */}
            <button
              onClick={() => setShowLivesModal(true)}
              className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-2.5 py-1.5 rounded-2xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer outline-none"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn("w-3.5 h-3.5 transition-all", i >= vidas && "opacity-30")}
                    fill={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                    color={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center mt-0.5">
                <span className={cn("text-[10px] font-black", vidas > 0 ? "text-[var(--color-danger)]" : "text-gray-400")}>
                  {vidas}/5
                </span>
                {vidas < 5 && nextRechargeSeconds > 0 && <MiniTimer seconds={nextRechargeSeconds} />}
              </div>
            </button>

            {/* Metros de Linha (XP) */}
            <button
              onClick={() => setShowXpModal(true)}
              className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-3 py-1.5 rounded-2xl shadow-sm hover:-translate-y-1 active:scale-95 transition-transform cursor-pointer outline-none"
            >
              <Wind className="w-5 h-5 text-[var(--color-info)] drop-shadow-sm" strokeWidth={3} />
              <span className="text-xs font-black mt-0.5 text-[var(--color-info)]">
                {metros}m
              </span>
            </button>

            {/* Chama (Ofensiva / Streak) */}
            <button
              onClick={() => setShowChamaModal(true)}
              className="flex flex-col items-center bg-white border-[3px] border-[#e5e5e5] px-3 py-1.5 rounded-2xl shadow-sm hover:-translate-y-1 active:scale-95 transition-transform cursor-pointer outline-none"
            >
              <Flame
                className="w-5 h-5 drop-shadow-sm"
                fill={ofensiva > 0 ? "var(--color-warning)" : "#e5e5e5"}
                color={ofensiva > 0 ? "var(--color-warning)" : "#a3a3a3"}
                strokeWidth={2}
              />
              <span className={cn("text-xs font-black mt-0.5", ofensiva > 0 ? "text-[var(--color-warning)]" : "text-gray-400")}>
                {ofensiva}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Lives status modal */}
      {showLivesModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLivesModal(false); }}
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-slide-up relative text-center border-4 border-white/20">
            <button
              onClick={() => setShowLivesModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X strokeWidth={3} className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce-hover">
              <Heart className="w-8 h-8 text-[var(--color-danger)]" fill="var(--color-danger)" />
            </div>

            <h2 className="font-display font-black text-2xl text-gray-900 uppercase">
              Papéis de Seda
            </h2>

            <div className="flex items-center gap-1.5 mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Heart
                  key={i}
                  className={cn("w-6 h-6 transition-all", i >= vidas ? "scale-90 opacity-30 grayscale" : "scale-100")}
                  fill={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                  color={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                />
              ))}
            </div>

            <p className="text-gray-600 font-medium leading-relaxed">
              Você tem <strong>{vidas}/5</strong> papéis de seda.<br />
              Cada erro em um quiz custa 1 papel.
            </p>

            {vidas < 5 ? (
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 w-full mt-2 flex flex-col items-center">
                <p className="text-[10px] text-gray-500 mb-1 font-black uppercase tracking-wider">Próximo papel em:</p>
                <div className="flex items-center justify-center gap-2 text-[var(--color-info)]">
                  <span className="font-display font-black text-3xl tabular-nums">
                    <MiniTimer seconds={nextRechargeSeconds} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 w-full mt-2">
                <p className="text-sm text-green-600 font-black uppercase tracking-wider">Vidas Cheias!</p>
                <p className="text-green-700 text-xs mt-1 font-medium">Sua pipa está pronta para voar alto.</p>
              </div>
            )}

            <button
              onClick={() => setShowLivesModal(false)}
              className="btn-3d-brand w-full py-4 mt-2 text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* XP/Metros Modal */}
      {showXpModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowXpModal(false); }}
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-slide-up relative text-center border-4 border-white/20">
            <button
              onClick={() => setShowXpModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X strokeWidth={3} className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce-hover">
              <Wind className="w-8 h-8 text-[var(--color-info)]" strokeWidth={2.5} />
            </div>

            <h2 className="font-display font-black text-2xl text-[var(--color-info-shadow)] uppercase">
              Metros de Linha
            </h2>

            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 w-full flex flex-col items-center">
              <p className="text-[10px] text-blue-500 mb-1 font-black uppercase tracking-wider">Acumulado Total</p>
              <span className="font-display font-black text-4xl text-[var(--color-info)] tabular-nums">
                {metros}m
              </span>
            </div>

            <p className="text-gray-600 font-medium leading-relaxed">
              Quanto mais você aprende e acerta as questões, mais linha sua pipa ganha para voar alto. Acumule metros para subir no Ranking!
            </p>

            <button
              onClick={() => setShowXpModal(false)}
              className="btn-3d w-full py-4 mt-2 text-sm text-white bg-[var(--color-info)] border-b-[4px] border-[var(--color-info-shadow)] hover:bg-[#1899d6]"
            >
              Incrível!
            </button>
          </div>
        </div>
      )}

      {/* Chama/Ofensiva Modal */}
      {showChamaModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setShowChamaModal(false); }}
        >
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-slide-up relative text-center border-4 border-white/20">
            <button
              onClick={() => setShowChamaModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors"
            >
              <X strokeWidth={3} className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-amberg-100 rounded-full flex items-center justify-center shadow-inner mb-2 animate-bounce-hover bg-yellow-100">
              <Flame className="w-8 h-8 text-[var(--color-warning)]" fill="var(--color-warning)" strokeWidth={2.5} />
            </div>

            <h2 className="font-display font-black text-2xl text-[var(--color-warning-shadow)] uppercase leading-tight">
              Ofensiva Atual
            </h2>

            <div className="bg-yellow-50 border-2 border-yellow-100 rounded-2xl p-4 w-full flex flex-col items-center">
              <p className="text-sm text-yellow-700 font-medium tracking-wide">Estou a</p>
              <span className="font-display font-black text-5xl text-[var(--color-warning)] tabular-nums my-1 drop-shadow-sm">
                {ofensiva}
              </span>
              <p className="text-sm text-yellow-700 font-bold uppercase tracking-wide">dias me Adaptando</p>
            </div>

            <p className="text-gray-600 font-medium leading-relaxed">
              Mantenha a sua ofensiva completando pelo menos uma fase (Leitura + Quiz) todos os dias. Se pular um dia, a chama apaga!
            </p>

            <button
              onClick={() => setShowChamaModal(false)}
              className="btn-3d w-full py-4 mt-2 text-sm text-amber-900 bg-[var(--color-warning)] border-b-[4px] border-[var(--color-warning-shadow)] hover:bg-[#ebbb00]"
            >
              Vamos lá!
            </button>
          </div>
        </div>
      )}

      {/* Profile Summary & Share Modal (Celebração do Herói - Duolingo Style) */}
      {showProfileModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
        >
          {/* Modal Container */}
          <div className="w-full h-full sm:h-auto sm:max-w-md bg-gradient-to-b from-orange-400 to-amber-500 sm:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden animate-slide-up">

            {/* Soft Sun/Clouds gradient overlay to add contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>

            {/* Fechar Modal */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-white hover:bg-black/20 transition-colors backdrop-blur-md cursor-pointer outline-none"
            >
              <X strokeWidth={3} className="w-5 h-5" />
            </button>

            {/* Content Wrapper */}
            <div className="flex-1 flex flex-col justify-between pt-12 pb-8 px-6 relative z-10 w-full h-full">

              <div className="text-center flex flex-col items-center flex-1">
                {/* Título Celebrativo */}
                <h2 className="font-display font-black text-3xl sm:text-4xl text-white drop-shadow-md tracking-wide uppercase mb-8">
                  Eu to<br />VOANDO ALTO!
                </h2>

                {/* Personagem (Avatar gigante estilo Duo) */}
                <div className="relative mb-8 mt-2">
                  <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-110"></div>
                  {voluntario?.avatar_url ? (
                    <img
                      src={voluntario.avatar_url}
                      alt={nome}
                      className="w-40 h-40 border-8 border-white object-cover shadow-2xl bg-orange-100 animate-bounce-hover relative z-10"
                      style={{ borderRadius: "2rem" }}
                    />
                  ) : (
                    <div
                      className="w-40 h-40 border-8 border-white shadow-2xl flex items-center justify-center text-6xl font-black text-white bg-[var(--color-brand)] animate-bounce-hover relative z-10"
                      style={{ borderRadius: "2rem" }}
                    >
                      {initials}
                    </div>
                  )}
                  {/* Etiqueta de nome do Herói */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-orange-500 font-black px-4 py-1.5 rounded-full shadow-lg border-[3px] border-orange-100 whitespace-nowrap z-20">
                    {nome}
                  </div>
                </div>

                {/* Stats Dashboard (RPG Style) */}
                <div className="w-full flex flex-col gap-3 mt-4">

                  {/* Linha de Métricas: Grid 2 colunas */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Card 1: Ofensiva (Compacto, número gigante) */}
                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border-2 border-slate-100 border-b-[5px] border-b-orange-200">
                      <Flame className="w-8 h-8 text-orange-500 mb-2" fill="currentColor" />
                      <span className="font-display font-black text-4xl text-orange-500 leading-none tabular-nums">{ofensiva}</span>
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">Ofensiva</span>
                    </div>

                    {/* Card 2: Metros de Linha (Compacto, número gigante) */}
                    <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border-2 border-slate-100 border-b-[5px] border-b-blue-200">
                      <span className="text-3xl mb-2 drop-shadow-sm">🪁</span>
                      <span className="font-display font-black text-4xl text-blue-500 leading-none tabular-nums">{metros}</span>
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">Metros</span>
                    </div>
                  </div>

                  {/* Linha Narrativa: Foco Atual (Full Width) */}
                  {currentFocus && (
                    <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border-2 border-orange-100 border-b-[5px] border-b-orange-200 text-left">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 rounded-xl flex items-center justify-center shrink-0">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-0.5">Foco Atual</h3>
                        <p className="text-slate-800 font-black text-base sm:text-lg leading-snug truncate">
                          {currentFocus}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Banner CTA: Convite VIP */}
                  <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 flex items-center gap-3 text-left mt-1">
                    <span className="text-3xl shrink-0">🚀</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sky-700 font-black text-sm leading-tight">Quer voar alto também?</p>
                      <p className="text-sky-600/80 text-xs font-medium leading-snug mt-0.5">Junte-se ao Instituto Ádapo. Capacite-se e ajude a transformar o Terceiro Setor!</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Botão de Ação / Compartilhamento */}
              <div className="mt-6 w-full shrink-0 relative z-20">
                <button
                  onClick={handleShare}
                  className="w-full py-4 bg-white text-orange-500 font-display font-black text-xl tracking-wide uppercase rounded-2xl border-b-[6px] border-b-orange-200 hover:bg-slate-50 hover:border-b-orange-100 hover:translate-y-[2px] active:border-b-0 active:translate-y-[6px] flex items-center justify-center gap-3 transition-all duration-150 shadow-lg cursor-pointer outline-none"
                  title="Compartilhar meu voo"
                >
                  <Share2 className="w-6 h-6 text-orange-400" strokeWidth={3} />
                  {shareCopied ? "Copiado!" : "Compartilhar meu voo"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
