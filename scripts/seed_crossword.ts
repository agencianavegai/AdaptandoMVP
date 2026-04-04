import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log("🔄 Seed Crossword Grid...");
  
  const gridPath = path.join(process.cwd(), "RAG MANUAL CRUZADA", "grid_cells.json");
  if (!fs.existsSync(gridPath)) {
    console.error("❌ grid_cells.json not found");
    process.exit(1);
  }

  const gridData = JSON.parse(fs.readFileSync(gridPath, "utf-8"));
  console.log(`📐 Grid: ${gridData.largura}x${gridData.altura}, ${gridData.cells.length} cells`);

  // Mundo 1 (crossword), Fase 1
  const mundoId = 11; // crossword worlds start at 11
  const faseOrdem = 1;

  // Find the pilula
  const { data: pilula, error: pErr } = await supabase
    .from("pilulas")
    .select("id")
    .eq("mundo_id", mundoId)
    .eq("ordem", faseOrdem)
    .single();

  if (pErr || !pilula) {
    console.error("❌ Pílula not found for mundo_id=11, ordem=1:", pErr);
    
    // Try mundo_id=1 (quiz world) as fallback — the existing grid was attached there
    console.log("⚡ Trying direct update on existing grid record...");
    
    const { data: existingGrid, error: gErr } = await supabase
      .from("palavras_cruzadas_grids")
      .select("id, pilula_id")
      .limit(1)
      .single();
    
    if (gErr || !existingGrid) {
      console.error("❌ No grid found at all:", gErr);
      process.exit(1);
    }
    
    console.log(`📍 Found existing grid: ${existingGrid.id}`);
    
    const { error: updErr } = await supabase
      .from("palavras_cruzadas_grids")
      .update({
        largura: gridData.largura,
        altura: gridData.altura,
        cells: gridData.cells,
      })
      .eq("id", existingGrid.id);
    
    if (updErr) {
      console.error("❌ Update failed:", updErr);
      process.exit(1);
    }
    
    console.log("✅ Grid updated successfully!");
    return;
  }

  console.log(`📍 Pílula: ${pilula.id}`);

  // Check for existing grid
  const { data: existing } = await supabase
    .from("palavras_cruzadas_grids")
    .select("id")
    .eq("pilula_id", pilula.id)
    .single();

  const payload = {
    pilula_id: pilula.id,
    largura: gridData.largura,
    altura: gridData.altura,
    cells: gridData.cells,
  };

  if (existing) {
    console.log(`♻️ Updating existing grid ${existing.id}...`);
    const { error } = await supabase
      .from("palavras_cruzadas_grids")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      console.error("❌ Update error:", error);
      process.exit(1);
    }
  } else {
    console.log("🆕 Inserting new grid...");
    const { error } = await supabase
      .from("palavras_cruzadas_grids")
      .insert(payload);
    if (error) {
      console.error("❌ Insert error:", error);
      process.exit(1);
    }
  }

  console.log("✅ Grid seeded successfully!");
}

main().catch(console.error);
