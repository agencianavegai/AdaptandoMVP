"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, Volume2, VolumeX, Shield, Info, MessageSquare, ArrowLeft, Send, Sun, Moon, Bell, BellOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { useGameSound } from "@/hooks/useGameSound";
import { submitFeedback } from "@/lib/actions/feedback";
import { savePushSubscription, removePushSubscription } from "@/lib/actions/push";
import { useTheme } from "next-themes";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type ScreenContext = "main" | "about" | "privacy" | "rights" | "feedback";

interface SettingsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsHubModal({ isOpen, onClose }: SettingsHubModalProps) {
  const [screen, setScreen] = useState<ScreenContext>("main");
  const { isMuted, toggleMute } = useAudio();
  const { playClick, playModalSwoosh } = useGameSound();
  const { theme, setTheme } = useTheme();

  // Feedback State
  const [feedMsg, setFeedMsg] = useState("");
  const [feedType, setFeedType] = useState<"sugestao" | "bug">("sugestao");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Admin / Dev State
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    import("@/lib/supabase/client").then(({ createSupabaseClient }) => {
      const supabase = createSupabaseClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      });
    });
  }, []);

  const adminEmailEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "";
  const adminEmails = adminEmailEnv
    ? adminEmailEnv.split(",").map(e => e.trim().toLowerCase())
    : ["filipegallo2@gmail.com"];
  const isAdmin = userEmail ? adminEmails.includes(userEmail.toLowerCase()) : false;

  // DEBUG: remover após confirmar funcionamento
  console.log("[Megafone Debug]", { userEmail, adminEmailEnv, adminEmails, isAdmin });

  // Push State
  const [isPushActive, setIsPushActive] = useState(false);
  const [isPushLoading, setIsPushLoading] = useState(false);
  
  // Broadcast State (Admin)
  const [broadcastTitle, setBroadcastTitle] = useState("Olá Adapetes! 🪁");
  const [broadcastBody, setBroadcastBody] = useState("Este é um teste, se você recebeu essa mensagem faça sua missão do dia e mande um 🪁 no grupo!");

  useEffect(() => {
    if (isOpen && "serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsPushActive(!!sub);
        });
      });
    }
  }, [isOpen]);

  const togglePush = async () => {
    playClick();
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setToastMsg("Notificações não suportadas pelo seu navegador.");
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }

    setIsPushLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (isPushActive && sub) {
        // Unsubscribe
        await sub.unsubscribe();
        await removePushSubscription();
        setIsPushActive(false);
        setToastMsg("Notificações desativadas.");
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Permissão negada");
        }

        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) throw new Error("Chave VAPID não configurada");

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });

        // Send to server
        await savePushSubscription(sub.toJSON() as any);
        setIsPushActive(true);
        setToastMsg("Lembretes ativados! 🪁");
      }
    } catch (err: any) {
      console.error(err);
      setToastMsg("Falha ao configurar notificações.");
      setIsPushActive(false);
    } finally {
      setIsPushLoading(false);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  if (!isOpen) {
    if (screen !== "main") setScreen("main");
    return null;
  }

  const isDark = theme === "dark";

  const handleClose = () => {
    playModalSwoosh();
    onClose();
    setTimeout(() => setScreen("main"), 300);
  };

  const navigateTo = (newScreen: ScreenContext) => {
    playClick();
    setScreen(newScreen);
  };

  const toggleSound = () => {
    playClick();
    toggleMute();
  };

  const toggleTheme = () => {
    playClick();
    setTheme(isDark ? "light" : "dark");
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedMsg.trim()) return;

    playClick();
    setIsSubmitting(true);
    try {
      await submitFeedback(feedMsg, feedType);
      setToastMsg("Sua mensagem voou até nossos desenvolvedores! 🪁");
      setFeedMsg("");
      setTimeout(() => setToastMsg(null), 4000);
      setTimeout(() => setScreen("main"), 2500);
    } catch {
      setToastMsg("Falha ao enviar, tente novamente.");
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 flex items-center justify-between px-5 py-4 border-b-2 border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {screen !== "main" && (
              <button
                onClick={() => navigateTo(screen === 'privacy' || screen === 'rights' ? 'about' : 'main')}
                className="p-1 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
            <h2 className="font-display font-black text-xl text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {screen === "main" && "Ajustes de Cria"}
              {screen === "about" && "Sobre o App"}
              {screen === "privacy" && "Privacidade"}
              {screen === "rights" && "Seus Direitos"}
              {screen === "feedback" && "Feedback"}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[75vh] overflow-y-auto scrollbar-hide flex flex-col gap-3">

          {/* SCREEN: MAIN */}
          {screen === "main" && (
            <div className="flex flex-col gap-2">
              {/* Toast for Main Screen messages (Push / Admin) */}
              {toastMsg && (
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-3 font-bold rounded-xl border border-orange-200 dark:border-orange-800 flex items-center gap-2 text-sm justify-center text-center animate-in fade-in duration-300">
                  {toastMsg}
                </div>
              )}

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isMuted ? "bg-red-100 dark:bg-red-900/30 text-red-500" : "bg-brand/10 text-brand")}>
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">Efeitos Sonoros</span>
                </div>
                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", isMuted ? "bg-slate-300 dark:bg-slate-600" : "bg-green-500")}>
                  <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform", !isMuted && "translate-x-6")} />
                </div>
              </button>

              {/* Push Toggle */}
              <button
                onClick={togglePush}
                disabled={isPushLoading}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isPushActive ? "bg-orange-500 text-white" : "bg-brand/10 text-brand dark:text-orange-400 dark:bg-orange-500/20")}>
                    {isPushLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isPushActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">Lembretes de Voo</span>
                </div>
                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", !isPushActive ? "bg-slate-300 dark:bg-slate-600" : "bg-orange-500")}>
                  <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform", isPushActive && "translate-x-6")} />
                </div>
              </button>

              {/* Test Megafone (Broadcast) */}
              {isAdmin && (
                <div className="w-full flex justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">Megafone (Admin)</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <input 
                      type="text" 
                      value={broadcastTitle} 
                      onChange={(e) => setBroadcastTitle(e.target.value)} 
                      placeholder="Título da Notificação"
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand font-bold"
                    />
                    <textarea 
                      value={broadcastBody} 
                      onChange={(e) => setBroadcastBody(e.target.value)} 
                      placeholder="Corpo da Notificação (Mensagem)"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-brand resize-none"
                    />
                    
                    <button
                      onClick={async () => {
                        playClick();
                        setIsPushLoading(true);
                        setToastMsg("Disparando Megafone... 🚀");
                        try {
                          const res = await fetch("/api/push/broadcast", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              title: broadcastTitle,
                              body: broadcastBody,
                              url: "/mapa"
                            }),
                          });
                          const data = await res.json();
                          if (res.ok && data.success) {
                            setToastMsg(`Sucesso! Enviado para ${data.results?.success} users.`);
                          } else {
                            setToastMsg(data.error || "Erro ao disparar broadcast.");
                          }
                        } catch (e) {
                          setToastMsg("Falha na rede ao testar.");
                        } finally {
                          setIsPushLoading(false);
                          setTimeout(() => setToastMsg(null), 4000);
                        }
                      }}
                      disabled={isPushLoading || !broadcastTitle || !broadcastBody}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 mt-1 shadow-sm"
                    >
                      {isPushLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Disparar para Todos
                    </button>
                  </div>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", isDark ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500" : "bg-amber-100 text-amber-500")}>
                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">
                    Aparência ({isDark ? "Escuro" : "Claro"})
                  </span>
                </div>
                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", isDark ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600")}>
                  <div className={cn("bg-white w-4 h-4 rounded-full shadow-sm transition-transform", isDark && "translate-x-6")} />
                </div>
              </button>

              {/* About */}
              <button
                onClick={() => navigateTo("about")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">Sobre o Adaptando</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>

              {/* Feedback */}
              <button
                onClick={() => navigateTo("feedback")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[15px]">Enviar Feedback</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          )}

          {/* SCREEN: ABOUT */}
          {screen === "about" && (
            <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-200">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200">
                <p className="text-[14px] leading-relaxed font-medium">
                  O projeto <strong>Adaptando</strong> é uma iniciativa educacional e gamificada desenvolvida pelo <strong>Instituto Ádapo</strong> para empoderar os membros do terceiro setor de forma lúdica, engajadora e transformadora.
                </p>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => navigateTo("privacy")}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left"
                >
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">Políticas de Privacidade</span>
                  <Shield className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigateTo("rights")}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-left"
                >
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-sm">Direitos dos Usuários</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN: PRIVACY */}
          {screen === "privacy" && (
            <div className="flex flex-col gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed animate-in slide-in-from-right-4 duration-200">
              <p>
                No Instituto Ádapo, levamos a proteção dos seus dados a sério. Coletamos informações de progresso do jogo e interações puramente para melhorar sua jornada educacional.
              </p>
              <p>
                As informações salvas englobam os testes respondidos e a métrica de desempenho contínuo (A &quot;Ofensiva&quot;). Nenhum dado sensível é repassado a terceiros de fins comerciais.
              </p>
            </div>
          )}

          {/* SCREEN: RIGHTS (LGPD) */}
          {screen === "rights" && (
            <div className="flex flex-col gap-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed animate-in slide-in-from-right-4 duration-200">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 font-medium">
                &quot;Você tem o direito de solicitar a exclusão total dos seus dados a qualquer momento.&quot;
              </div>
              <p>
                Conforme a Lei Geral de Proteção de Dados (LGPD), você detém controle do que coletamos. Você tem o direito ao acesso, correção de informações incompletas, anonimização e portabilidade.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Para solicitar remoção, entre em contato via Feedback ou com os administradores.
              </p>
            </div>
          )}

          {/* SCREEN: FEEDBACK */}
          {screen === "feedback" && (
            <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-200">
              {toastMsg ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-4 font-bold rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-2 text-sm justify-center text-center animate-in fade-in duration-300">
                  {toastMsg}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFeedType("sugestao")}
                      className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", feedType === "sugestao" ? "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                    >
                      💡 Sugestão
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedType("bug")}
                      className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", feedType === "bug" ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm" : "text-slate-500 hover:text-red-500")}
                    >
                      🐛 Erro / Bug
                    </button>
                  </div>

                  <textarea
                    autoFocus
                    required
                    value={feedMsg}
                    onChange={(e) => setFeedMsg(e.target.value)}
                    placeholder={feedType === 'sugestao' ? "Como podemos empolgar mais o seu voo?" : "O que atrapalhou seu progresso?"}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all resize-none h-32"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !feedMsg.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm uppercase tracking-wide py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 shadow-[0_4px_10px_-4px_rgba(249,115,22,0.6)]"
                  >
                    {isSubmitting ? "Enviando..." : (
                      <>
                        Confirmar <Send className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
