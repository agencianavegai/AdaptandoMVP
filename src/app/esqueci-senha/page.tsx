"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { AlertTriangle, Loader2, Mail, CheckCircle, ArrowLeft } from "lucide-react";
import AboutModal from "@/components/auth/AboutModal";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/atualizar-senha`,
    });

    if (error) {
      setErro("Ops! Não conseguimos enviar o e-mail. Verifique o endereço e tente novamente.");
      setLoading(false);
    } else {
      setSucesso(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative">

      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-14 h-14 rounded-full bg-white/5 animate-float" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="absolute top-1/2 right-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 w-10 h-10 rounded-full bg-[var(--color-brand)]/10 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="w-full max-w-md z-10 flex flex-col items-center">

        {/* LOGO & HERO TEXT */}
        <div className="mb-8 text-center animate-slide-up">
          <img
            src="/logo.png"
            alt="Instituto Ádapo"
            className="w-24 h-24 mx-auto mb-4 transform -rotate-3 hover:rotate-0 transition-transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] object-contain"
          />
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-wider drop-shadow-md">
            Recuperar Acesso
          </h1>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white/95 backdrop-blur-xl w-full p-8 sm:p-10 shadow-2xl flex flex-col gap-6 animate-slide-up" style={{ borderRadius: "32px", animationDelay: "0.1s" }}>
          
          {sucesso ? (
            <div className="flex flex-col items-center text-center animate-pop-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--color-text-primary)] mb-2 uppercase tracking-wide">Pipa enviada! 🪁</h2>
              <p className="text-[var(--color-text-secondary)] font-bold mb-6">
                Te enviamos uma pipa-correio! Verifique seu e-mail para redefinir a senha.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="btn-outline w-full py-4 text-lg font-black uppercase tracking-wider !rounded-2xl flex items-center justify-center gap-2"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              <p className="text-[var(--color-text-secondary)] font-bold text-center">
                Esqueceu a senha? Relaxa! Digite seu e-mail abaixo e enviaremos um link para você criar uma nova.
              </p>
              
              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                    E-mail da Conta
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors pl-12"
                      placeholder="seunome@pipa.com"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                  </div>
                </div>

                {erro && (
                  <div className="bg-red-100 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 animate-pop-in" role="alert">
                    <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} /> {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-3d-brand py-5 text-lg mt-2 w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> ENVIANDO...</>
                  ) : (
                    "ENVIAR LINK"
                  )}
                </button>
              </form>
            </>
          )}

        </div>

        {/* BACK TO LOGIN LINK */}
        {!sucesso && (
           <button
             onClick={() => router.push("/login")}
             className="mt-8 text-white font-bold animate-slide-up flex items-center gap-2 hover:text-[var(--color-brand-light)] transition-colors"
             style={{ animationDelay: "0.2s" }}
           >
             <ArrowLeft className="w-4 h-4" strokeWidth={3} /> Voltar para o Login
           </button>
        )}
      </div>

      <AboutModal />
    </div>
  );
}
