import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ClientPage from './ClientPage';

export default async function AtualizarSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>;
}) {
  const params = await searchParams;
  const { code, error, error_description } = params;

  // If Supabase sends an error in the URL
  if (error) {
    return <ClientPage initialError={error_description || "O link fornecido é inválido ou expirou."} />;
  }

  // If PKCE code is present (fallback if user lands here directly with ?code=)
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      return <ClientPage initialError="Link de recuperação expirado ou já utilizado." />;
    }

    // Redirect to clean URL after successful exchange
    redirect('/atualizar-senha');
  }

  // No code or error — render the client form (session should already exist from callback)
  return <ClientPage />;
}
