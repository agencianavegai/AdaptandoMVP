"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { AlertTriangle, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Vixe, deu ruim! Verifica seu email e senha.");
      setLoading(false);
    } else {
      router.push("/mapa"); // Redireciona pro dashboard
    }
  }

  return (
    <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative">

      {/* Decorative Background Blobs (CSS only, no emojis) */}
      <div className="absolute top-1/4 left-10 w-14 h-14 rounded-full bg-white/5 animate-float" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="absolute top-1/2 right-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 w-10 h-10 rounded-full bg-[var(--color-brand)]/10 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="w-full max-w-md z-10 flex flex-col items-center">

        {/* LOGO & HERO TEXT */}
        <div className="mb-10 text-center animate-slide-up">
          <img
            src="/logo.png"
            alt="Instituto Ádapo"
            className="w-28 h-28 mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] object-contain"
          />
          <h1 className="font-display font-black text-4xl text-white uppercase tracking-wider drop-shadow-md">
            | Adaptando |
          </h1>
          <p className="mt-3 text-lg font-bold text-white/80 tracking-wide">
            Aprenda sobre ONGs enquanto joga e desafia seus amigos.
          </p>
        </div>

        {/* LOGIN FORM - GAMER STYLE */}
        <div className="bg-white/95 backdrop-blur-xl w-full p-8 sm:p-10 shadow-2xl flex flex-col gap-6 animate-slide-up" style={{ borderRadius: "32px", animationDelay: "0.1s" }}>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors"
                placeholder="emicida@gmail.com"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? "Esconder senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <a 
                  href="/esqueci-senha" 
                  className="text-sm font-bold text-[var(--color-brand)] hover:text-[var(--color-brand-light)] transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {erro && (
              <div className="bg-red-100 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 animate-pop-in" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} /> {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-brand py-5 text-xl mt-2 w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> ENTRANDO...</>
              ) : (
                "ENTRAR"
              )}
            </button>
          </form>

        </div>

        {/* CADASTRO LINK */}
        <p className="mt-8 text-white font-bold animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Nova por aqui?{" "}
          <a
            href="/cadastro"
            className="text-[var(--color-brand-light)] hover:text-white underline decoration-2 underline-offset-4 transition-colors ml-1"
          >
            Fazer Cadastro
          </a>
        </p>
      </div>
    </div>
  );
}
