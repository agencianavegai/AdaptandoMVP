"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { AlertTriangle, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import AboutModal from "@/components/auth/AboutModal";

export default function ClientPage({ initialError }: { initialError?: string }) {
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [erro, setErro] = useState(initialError || "");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  // Listen for auth state changes — handles hash fragment (#access_token=...&type=recovery)
  // which is the Implicit flow used by some Supabase configurations
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      }
    });

    // Also check if session already exists (from PKCE exchange in server component)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    const { error } = await supabase.auth.updateUser({
      password: senha,
    });

    if (error) {
      console.error("updateUser error:", error);
      setErro("Não conseguimos atualizar sua senha. Talvez a sessão tenha expirado. Solicite um novo link.");
      setLoading(false);
    } else {
      router.push("/mapa");
    }
  }

  return (
    <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative pb-20">

      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-14 h-14 rounded-full bg-white/5 animate-float" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="absolute top-1/2 right-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 w-10 h-10 rounded-full bg-[var(--color-brand)]/10 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="w-full max-w-md z-10 flex flex-col items-center pt-8">

        {/* LOGO & HERO TEXT */}
        <div className="mb-8 text-center animate-slide-up">
          <img
            src="/logo.png"
            alt="Instituto Ádapo"
            className="w-24 h-24 mx-auto mb-4 transform -rotate-3 hover:rotate-0 transition-transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] object-contain"
          />
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-wider drop-shadow-md">
            Nova Senha
          </h1>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white/95 backdrop-blur-xl w-full p-8 sm:p-10 shadow-2xl flex flex-col gap-6 animate-slide-up" style={{ borderRadius: "32px", animationDelay: "0.1s" }}>
          
          <p className="text-[var(--color-text-secondary)] font-bold text-center">
            Pipa resgatada! Crie uma senha nova e segura para voltar aos céus do Ádapo.
          </p>
          
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 mt-2">
            
            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                Sua Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 pl-12 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors pr-12"
                  placeholder="Mínimo de 6 caracteres"
                  minLength={6}
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={showPassword ? "Esconder senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-100 border-2 border-red-200 text-red-600 px-4 py-3 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2 animate-pop-in" role="alert">
                <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={2.5} /> {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || senha.length < 6}
              className="btn-3d-brand py-5 text-lg mt-2 w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> SALVANDO...</>
              ) : (
                "SALVAR E ENTRAR"
              )}
            </button>
          </form>

        </div>
      </div>

      <AboutModal />
    </div>
  );
}
