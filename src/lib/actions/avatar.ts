"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Upload an actual photo to Supabase Storage and set it as the user's avatar
 */
export async function uploadRealPhoto(formData: FormData) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Não autenticado");
    }

    const file = formData.get("file") as File | null;
    if (!file) {
      throw new Error("Nenhum arquivo enviado.");
    }

    // Prepare filepath (e.g. user_id/timestamp-filename.ext)
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-avatar.${fileExt}`;

    // Upload to 'avatars' bucket
    const { error: uploadError, data } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Falha no upload: ${uploadError.message}`);
    }

    // Fetch public URL
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Update user row
    const { error: dbError } = await supabase
      .from("voluntarios")
      .update({
        avatar_type: "upload",
        uploaded_url: publicUrl,
      })
      .eq("id", user.id);

    if (dbError) {
      throw new Error(`Erro ao atualizar perfil: ${dbError.message}`);
    }

    // Revalidate affected routes
    revalidatePath("/perfil", "page");
    revalidatePath("/mapa");
    revalidatePath("/ranking", "page");

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("uploadRealPhoto error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update the user's customized Adapete Character and Background Color
 */
export async function updateAdapeteCharacter(characterId: string, bgColor: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Não autenticado");
    }

    // Update user row
    const { error: dbError } = await supabase
      .from("voluntarios")
      .update({
        avatar_type: "character",
        character_id: characterId,
        avatar_bg_color: bgColor,
      })
      .eq("id", user.id);

    if (dbError) {
      throw new Error(`Erro ao atualizar perfil: ${dbError.message}`);
    }

    // Revalidate affected routes
    revalidatePath("/perfil", "page");
    revalidatePath("/mapa");
    revalidatePath("/ranking", "page");

    return { success: true };
  } catch (error: any) {
    console.error("updateAdapeteCharacter error:", error);
    return { success: false, error: error.message };
  }
}
