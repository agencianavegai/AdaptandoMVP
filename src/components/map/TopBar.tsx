"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy, Clock, X, Info, Flame, Target, User, Heart, Star, Share2, Check, VolumeX, Volume2, Wind, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPng } from "html-to-image";
import { useAudio } from "@/contexts/AudioContext";
import { useGameSound } from "@/hooks/useGameSound";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AvatarLightboxModal } from "@/components/profile/AvatarLightboxModal";

interface TopBarProps {
  voluntario: {
    nome: string;
    avatar_url?: string | null;
    avatar_type?: string | null;
    uploaded_url?: string | null;
    character_id?: string | null;
    avatar_bg_color?: string | null;
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
  const [showLightbox, setShowLightbox] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const nome = voluntario?.nome || "Cria";
  const initials = nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const vidas = voluntario?.vidas_atuais ?? 5;
  const metros = voluntario?.metros_linha ?? 0;
  const ofensiva = voluntario?.ofensiva_atual ?? 0;

  const { isMuted, toggleMute } = useAudio();
  const { playClick, playHover, playModalSwoosh } = useGameSound();

  // Lock body scroll when profile modal is open (prevents scroll bleed on mobile)
  useEffect(() => {
    if (showProfileModal) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showProfileModal]);

  const handleOpenModal = (setModal: (v: boolean) => void) => {
    playModalSwoosh();
    setModal(true);
  };

  const handleShare = async () => {
    playClick();
    if (!captureRef.current || shareLoading) return;
    setShareLoading(true);

    const focusText = currentFocus ? ` Meu foco atual é dominar: ${currentFocus}.` : "";
    const text = `Estou a ${ofensiva} dias me Adaptando no Instituto Ádapo!${focusText} Vem dar linha pra sonhar também! 🪁🔥 #Adaptdando #InstitutoAdapo`;

    try {
      // Generate PNG at 9:16 Story ratio (1080×1920) for Instagram/WhatsApp Stories
      // Using 540x960 CSS dimensions with pixelRatio 2 to ensure text sizes scale
      // up correctly (not tiny) while maintaining the 1080x1920 output perfectly.
      const dataUrl = await toPng(captureRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        width: 540,
        height: 960,
        style: {
          width: '540px',
          height: '960px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #fb923c, #f59e0b)', // Ensures gradient fills entirely
          margin: 0,
        },
      });

      // Convert data URL to Blob then File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "voo-adapo.png", { type: "image/png" });

      // Try native share with image
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Meu Voo no Instituto Ádapo",
          text,
        });
      } else {
        // Fallback: auto-download the image
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = "voo-adapo.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      }
    } catch (err) {
      console.log("Compartilhamento cancelado ou falhou", err);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-2 sm:px-4 py-2 sm:py-4 w-full bg-black/20 backdrop-blur-md">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1.5 sm:gap-4">

          {/* AVATAR + Name */}
          <button
            onClick={() => handleOpenModal(setShowProfileModal)}
            onMouseEnter={playHover}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-transform group text-left outline-none shrink-0"
          >
            {voluntario && (
              <UserAvatar
                user={voluntario}
                className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] sm:border-4 border-white shadow-lg"
                iconSizeClassName="text-sm font-black"
                style={{ borderRadius: "var(--radius-kite)" }}
              />
            )}

            <span className="text-sm sm:text-lg font-display font-black text-white drop-shadow-md hidden min-[380px]:block truncate max-w-[60px] sm:max-w-[90px] group-hover:text-[var(--color-brand-light)] transition-colors">
              {nome.split(" ")[0]}
            </span>
          </button>

          {/* METRICS */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Volume Toggle */}
            <button
              onClick={() => {
                playClick();
                toggleMute();
              }}
              onMouseEnter={playHover}
              className="flex flex-col items-center justify-center bg-white border-[2px] sm:border-[3px] border-[#e5e5e5] w-[34px] h-[38px] sm:w-[42px] sm:h-[46px] rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-1 active:scale-95 transition-transform cursor-pointer outline-none shrink-0"
              aria-label={isMuted ? "Ativar som" : "Desativar som"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-brand)]" />
              )}
            </button>

            {/* Papéis de Seda (Vidas) — Clickable to open Modal */}
            <button
              onClick={() => handleOpenModal(setShowLivesModal)}
              onMouseEnter={playHover}
              className="flex flex-col items-center bg-white border-[2px] sm:border-[3px] border-[#e5e5e5] px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-sm transition-transform hover:-translate-y-1 active:scale-95 cursor-pointer outline-none shrink-0"
            >
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart
                    key={i}
                    className={cn("w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 transition-all", i >= vidas && "opacity-30")}
                    fill={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                    color={i < vidas ? "var(--color-danger)" : "#d1d5db"}
                  />
                ))}
              </div>
              <div className="flex items-center justify-center mt-0.5">
                <span className={cn("text-[8px] sm:text-[10px] font-black", vidas > 0 ? "text-[var(--color-danger)]" : "text-gray-400")}>
                  {vidas}/5
                </span>
                {vidas < 5 && nextRechargeSeconds > 0 && <MiniTimer seconds={nextRechargeSeconds} />}
              </div>
            </button>

            {/* Metros de Linha (XP) */}
            <button
              onClick={() => handleOpenModal(setShowXpModal)}
              onMouseEnter={playHover}
              className="flex flex-col items-center bg-white border-[2px] sm:border-[3px] border-[#e5e5e5] px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-1 active:scale-95 transition-transform cursor-pointer outline-none shrink-0"
            >
              <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-info)] drop-shadow-sm" strokeWidth={3} />
              <span className="text-[10px] sm:text-xs font-black mt-0.5 text-[var(--color-info)]">
                {metros}m
              </span>
            </button>

            {/* Chama (Ofensiva / Streak) */}
            <button
              onClick={() => handleOpenModal(setShowChamaModal)}
              onMouseEnter={playHover}
              className="flex flex-col items-center bg-white border-[2px] sm:border-[3px] border-[#e5e5e5] px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-sm hover:-translate-y-1 active:scale-95 transition-transform cursor-pointer outline-none shrink-0"
            >
              <Flame
                className="w-4 h-4 sm:w-5 sm:h-5 drop-shadow-sm"
                fill={ofensiva > 0 ? "var(--color-warning)" : "#e5e5e5"}
                color={ofensiva > 0 ? "var(--color-warning)" : "#a3a3a3"}
                strokeWidth={2}
              />
              <span className={cn("text-[10px] sm:text-xs font-black mt-0.5", ofensiva > 0 ? "text-[var(--color-warning)]" : "text-gray-400")}>
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
              Mantenha a sua ofensiva completando pelo menos uma fase todos os dias. Se pular um dia, a chama apaga!
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-3 sm:p-4 overscroll-contain touch-none"
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
        >
          {/* Modal Container — fit-to-screen on mobile, no scroll needed */}
          <div className="w-full max-h-[calc(100dvh-24px)] sm:max-h-[90vh] overflow-hidden sm:max-w-md bg-gradient-to-b from-orange-400 to-amber-500 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col relative animate-slide-up">

            {/* Fechar Modal (FORA da captura) */}
            <button
              onClick={() => setShowProfileModal(false)}
              className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-black/10 rounded-full flex items-center justify-center text-white hover:bg-black/20 transition-colors backdrop-blur-md cursor-pointer outline-none"
            >
              <X strokeWidth={3} className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* ===== ÁREA CAPTURÁVEL (ref para html-to-image) ===== */}
            <div ref={captureRef} className="bg-gradient-to-b from-orange-400 to-amber-500 relative overflow-hidden">

              {/* Soft Sun/Clouds gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>

              {/* Content Wrapper */}
              <div className="flex flex-col items-center pt-8 sm:pt-12 pb-4 sm:pb-6 px-4 sm:px-6 relative z-10 w-full">

                <div className="text-center flex flex-col items-center">
                  {/* Título Celebrativo */}
                  <h2 className="font-display font-black text-2xl sm:text-4xl text-white drop-shadow-md tracking-wide uppercase mb-4 sm:mb-8">
                    Eu to<br />VOANDO ALTO!
                  </h2>

                  {/* Personagem (Avatar gigante estilo Duo) */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLightbox(true);
                    }}
                    className="relative mb-5 sm:mb-8 mt-1 sm:mt-2 cursor-pointer outline-none group hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-110"></div>
                    {voluntario && (
                      <UserAvatar
                        user={voluntario}
                        className="w-28 h-28 sm:w-40 sm:h-40 border-[6px] sm:border-8 border-white shadow-2xl relative z-10"
                        iconSizeClassName="text-4xl sm:text-6xl font-black"
                        style={{ borderRadius: "1.5rem" }}
                      />
                    )}
                    {/* Etiqueta de nome do Herói */}
                    <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-white text-orange-500 font-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg border-[3px] border-orange-100 whitespace-nowrap z-20 text-sm sm:text-base">
                      {nome}
                    </div>
                  </button>

                  {/* Stats Dashboard (RPG Style) */}
                  <div className="w-full flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-4">

                    {/* Linha de Métricas: Grid 2 colunas */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {/* Card 1: Ofensiva */}
                      <div className="bg-white rounded-2xl p-2.5 sm:p-4 flex flex-col items-center text-center shadow-sm border-2 border-slate-100 border-b-[4px] sm:border-b-[5px] border-b-orange-200">
                        <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mb-1 sm:mb-2" fill="currentColor" />
                        <span className="font-display font-black text-3xl sm:text-4xl text-orange-500 leading-none tabular-nums">{ofensiva}</span>
                        <span className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1">Ofensiva</span>
                      </div>

                      {/* Card 2: Metros de Linha */}
                      <div className="bg-white rounded-2xl p-2.5 sm:p-4 flex flex-col items-center text-center shadow-sm border-2 border-slate-100 border-b-[4px] sm:border-b-[5px] border-b-blue-200">
                        <span className="text-2xl sm:text-3xl mb-1 sm:mb-2 drop-shadow-sm">🪁</span>
                        <span className="font-display font-black text-3xl sm:text-4xl text-blue-500 leading-none tabular-nums">{metros}</span>
                        <span className="text-slate-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mt-1">Metros</span>
                      </div>
                    </div>

                    {/* Linha Narrativa: Foco Atual (Full Width) */}
                    {currentFocus && (
                      <div className="bg-white rounded-2xl p-2.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm border-2 border-orange-100 border-b-[4px] sm:border-b-[5px] border-b-orange-200 text-left">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-orange-100 border border-orange-200 rounded-xl flex items-center justify-center shrink-0">
                          <span className="text-lg sm:text-2xl">🎯</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-orange-500 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest mb-0.5">Aprendendo mais sobre:</h3>
                          <p className="text-slate-800 font-black text-sm sm:text-lg leading-snug truncate">
                            {currentFocus}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Banner CTA: Convite VIP */}
                    <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 text-left">
                      <span className="text-2xl sm:text-3xl shrink-0">🚀</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sky-700 font-black text-xs sm:text-sm leading-tight">Quer voar alto também?</p>
                        <p className="text-sky-600/80 text-[11px] sm:text-xs font-medium leading-snug mt-0.5">Junte-se ao Instituto Ádapo e transforme o Terceiro Setor!</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Assinatura Instagram 📸 (Dentro da captura) */}
                <div className="w-full mt-3 sm:mt-5 flex items-center justify-center gap-1.5 sm:gap-2 opacity-80">
                  <span className="text-white/90 font-bold text-[11px] sm:text-xs tracking-wide drop-shadow-sm">Game de estudos desenvolvido por:</span>
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide drop-shadow-md">@instituto.adapo</span>
                  <span className="text-xs sm:text-sm">🪁</span>
                </div>

              </div>
            </div>
            {/* ===== FIM DA ÁREA CAPTURÁVEL ===== */}

            {/* Botão de Ação / Compartilhamento (FORA da captura) */}
            <div className="px-4 sm:px-6 pb-5 sm:pb-8 pt-3 sm:pt-4 relative z-20 bg-gradient-to-t from-amber-500 to-amber-500">
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className="w-full py-3 sm:py-4 bg-white text-orange-500 font-display font-black text-base sm:text-xl tracking-wide uppercase rounded-2xl border-b-[5px] sm:border-b-[6px] border-b-orange-200 hover:bg-slate-50 hover:border-b-orange-100 hover:translate-y-[2px] active:border-b-0 active:translate-y-[5px] sm:active:translate-y-[6px] flex items-center justify-center gap-2 sm:gap-3 transition-all duration-150 shadow-lg cursor-pointer outline-none disabled:opacity-70 disabled:pointer-events-none"
                title="Compartilhar meu voo"
              >
                {shareLoading ? (
                  <><Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> Preparando...</>
                ) : shareCopied ? (
                  <><Download className="w-5 h-5 sm:w-6 sm:h-6" /> Imagem salva!</>
                ) : (
                  <><Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" strokeWidth={3} /> Compartilhar meu voo</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      <AvatarLightboxModal 
        isOpen={showLightbox} 
        onClose={() => setShowLightbox(false)} 
        user={voluntario} 
      />
    </>
  );
}
