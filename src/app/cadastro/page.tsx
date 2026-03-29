"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";
import { AlertTriangle, Loader2, Eye, EyeOff, HelpCircle } from "lucide-react";
import AboutModal from "@/components/auth/AboutModal";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAdapete, setIsAdapete] = useState(false);
  const [showAdapeteInfo, setShowAdapeteInfo] = useState(false);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseClient();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErro("");

    // 1. Criar Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: nome, // Save name in user metadata
        },
      },
    });

    if (authError) {
      setErro(authError.message);
      setLoading(false);
      return;
    }

    // 2. Insert into voluntarios table (if sign up successful)
    if (authData.user) {
      const { error: insertError } = await supabase.from("voluntarios").insert({
        id: authData.user.id,
        nome: nome,
        email: email,
        is_adapete: isAdapete,
      });

      if (insertError) {
        console.error("Erro ao criar perfil de voluntario:", insertError);
        // We continue anyway, the trigger or manual fix might be needed, but auth is done.
      }
      
      // Attempt login immediately
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      router.push("/mapa");
    } else {
        setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh gradient-storm flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative pb-20">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-1/4 left-10 w-14 h-14 rounded-full bg-white/5 animate-float" style={{ animationDelay: '0s' }} aria-hidden="true" />
      <div className="absolute top-1/2 right-12 w-20 h-20 rounded-full bg-white/5 animate-float" style={{ animationDelay: '1.2s' }} aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/4 w-10 h-10 rounded-full bg-[var(--color-brand)]/10 animate-float" style={{ animationDelay: '2s' }} aria-hidden="true" />

      <div className="w-full max-w-md z-10 flex flex-col items-center pt-8">
        
        {/* HEADER */}
        <div className="mb-8 text-center animate-slide-up">
          <img 
            src="/logo.png" 
            alt="Instituto Ádapo" 
            className="w-28 h-28 mx-auto mb-6 transform -rotate-3 hover:rotate-0 transition-transform drop-shadow-[0_8px_8px_rgba(0,0,0,0.3)] object-contain" 
          />
          <h1 className="font-display font-black text-3xl text-white uppercase tracking-wider drop-shadow-md">
            Nova Pipa no Céu!
          </h1>
          <p className="mt-2 text-lg font-bold text-white/80 tracking-wide">
            Crie sua conta para começar.
          </p>
        </div>

        {/* CADASTRO FORM - GAMER STYLE */}
        <div className="bg-white/95 backdrop-blur-xl w-full p-8 sm:p-10 shadow-2xl flex flex-col gap-6 animate-slide-up" style={{ borderRadius: "32px", animationDelay: "0.1s" }}>
          
          <form onSubmit={handleCadastro} className="flex flex-col gap-5">
            
            {/* Nome */}
            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                Nome de Cria
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors"
                placeholder="Como te chamam?"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors"
                placeholder="seunome@pipa.com"
                required
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-2">
              <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1">
                Senha Forte
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="bg-[#f0f0f0] border-2 border-[#e5e5e5] rounded-2xl px-5 py-4 w-full text-[var(--color-text-primary)] font-bold text-lg placeholder:text-gray-400 focus:outline-none focus:border-[var(--color-info)] focus:bg-white transition-colors pr-12"
                  placeholder="Mínimo 6 letras/números"
                  required
                  minLength={6}
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
            </div>

            {/* Adapete Toggle */}
            <div className="flex flex-col gap-2 w-full max-w-full overflow-hidden">
              <div className="flex flex-row items-center justify-between gap-2 w-full max-w-full">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <label className="font-black text-[var(--color-text-secondary)] uppercase text-sm tracking-wider ml-1 truncate">
                    Sou um Adapete
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAdapeteInfo(!showAdapeteInfo)}
                    className="text-gray-400 hover:text-[var(--color-info)] transition-colors shrink-0 p-1 outline-none"
                    aria-label="O que é um Adapete?"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                {/* Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAdapete}
                  onClick={() => setIsAdapete(!isAdapete)}
                  className={`relative w-14 h-8 shrink-0 rounded-full transition-colors duration-300 ${isAdapete ? 'bg-[var(--color-brand)]' : 'bg-gray-300'} outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-brand)]`}
                >
                  <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${isAdapete ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Adapete Info Tooltip */}
              {showAdapeteInfo && (
                <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl p-4 text-sky-700 text-sm font-medium leading-relaxed animate-pop-in">
                  <strong>Adapetes</strong> são os membros oficiais e voluntários internos do Instituto Ádapo. Se você é novo por aqui e quer aprender com a gente, deixe desmarcado e junte-se aos <strong>Viajantes</strong>! 🪁
                </div>
              )}
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
                <><Loader2 className="w-5 h-5 animate-spin" /> CRIANDO...</>
              ) : (
                "CRIAR CONTA"
              )}
            </button>
          </form>

        </div>

        {/* LOGIN LINK */}
        <p className="mt-8 text-white font-bold animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Já tem conta?{" "}
          <button
            onClick={() => router.push("/login")}
            className="text-[var(--color-brand-light)] hover:text-white underline decoration-2 underline-offset-4 transition-colors ml-1"
          >
            Fazer Login
          </button>
        </p>

      </div>

      <AboutModal />
    </div>
  );
}
