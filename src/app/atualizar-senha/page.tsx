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

  // Se o Supabase enviar um erro na URL (ex: token expirado da recuperação via Implicit Flow ou PKCE failure)
  if (error) {
    return <ClientPage initialError={error_description || "O link fornecido é inválido ou expirou."} />;
  }

  // Se o fluxo PKCE estiver ativo, recebemos um "code". 
  // Precisamos trocar esse code por uma Sessão do Supabase. Somente com a Sessão ativa o updateUser(newPassword) vai funcionar!
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      return <ClientPage initialError="Link de recuperação expirado ou já utilizado." />;
    }

    // Após trocar o code pela Sessão com sucesso, nós redirecionamos de volta para a mesma página sem o ?code=, para limpar a URL para o usuário.
    redirect('/atualizar-senha');
  }

  // Se não houver ?code= nem ?error=, significa que a URL está limpa. 
  // Retornamos a página de Cliente para que o usuário possa interagir e digitar a nova senha.
  return <ClientPage />;
}
