"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { X, Check, Loader2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateAdapeteCharacter } from "@/lib/actions/avatar";

interface AdapeteCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (characterId: string, bgColor: string) => void;
  currentBgColor?: string;
  currentCharacterId?: string;
}

const AVAILABLE_CHARACTERS = [
  "1_20260327_215428_0000.png",
  "2_20260327_215429_0001.png",
  "3_20260327_215429_0002.png",
  "4_20260327_215429_0003.png",
  "5_20260327_215429_0004.png",
  "6_20260327_215429_0005.png",
  "7_20260327_215430_0006.png",
  "8_20260327_215430_0007.png",
  "9_20260327_215430_0008.png",
  "10_20260327_215430_0009.png",
  "11_20260327_215430_0010.png",
  "12_20260327_215431_0011.png",
  "13_20260327_215431_0012.png"
];

const PRESET_COLORS = [
  "#FF5733", "#33FFF9", "#FF33D4", "#33FF57", "#FFF333", 
  "#8A2BE2", "#FF8C00", "#1E90FF", "#32CD32", "#FF1493",
  "#c084fc", "#4ade80", "#f472b6", "#38bdf8", "#facc15"
];

export function AdapeteCreatorModal({ isOpen, onClose, onSaved, currentBgColor, currentCharacterId }: AdapeteCreatorModalProps) {
  const [selectedChar, setSelectedChar] = useState<string>(currentCharacterId || AVAILABLE_CHARACTERS[0]);
  const [bgColor, setBgColor] = useState<string>(currentBgColor || PRESET_COLORS[0]);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateAdapeteCharacter(selectedChar, bgColor);
      if (res.success) {
        onSaved(selectedChar, bgColor);
        onClose();
      } else {
        alert("Erro ao salvar o Adapete.");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between z-10">
          <h2 className="font-display font-black text-2xl text-slate-800 uppercase tracking-wide">
            Criar Adapete
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200"
          >
            <X strokeWidth={3} className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8 custom-scrollbar">
          
          {/* Live Preview */}
          <div className="flex flex-col items-center">
            <div 
              className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl shadow-xl transition-all duration-300 relative overflow-hidden border-4 border-white ring-4 ring-slate-100"
              style={{ backgroundColor: bgColor }}
            >
              <Image 
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/personagens/${selectedChar}`} 
                alt="Preview do Personagem" 
                fill 
                className="object-cover"
                sizes="200px"
                priority
              />
            </div>
            <p className="mt-4 text-slate-500 font-bold text-sm uppercase tracking-widest">
              Live Preview
            </p>
          </div>

          {/* Color Picker */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-slate-700 uppercase tracking-wide">Cor de Fundo</h3>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center bg-slate-50 p-3 sm:p-4 rounded-2xl border-2 border-slate-100">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setBgColor(color)}
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-xl transition-all",
                    bgColor === color ? "scale-110 ring-2 ring-offset-2 ring-slate-800 shadow-md" : "hover:scale-105 active:scale-95"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <div className="relative group">
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={(e) => setBgColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
                />
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border-2 pl-2 pt-1 sm:pt-1 sm:pl-2.5 border-dashed border-slate-300 flex items-center justify-center bg-transparent group-hover:border-slate-400 focus-within:ring-2 ring-slate-800 shadow-sm relative overflow-hidden" style={{backgroundColor: bgColor}}>
                    <span className="font-display font-black text-slate-600/30 text-2xl drop-shadow-sm">+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Character Grid */}
          <div>
            <h3 className="font-black text-slate-700 uppercase tracking-wide mb-3">Escolha seu Avatar</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {AVAILABLE_CHARACTERS.map(char => (
                <button
                  key={char}
                  onClick={() => setSelectedChar(char)}
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1",
                    selectedChar === char 
                      ? "border-amber-400 bg-amber-50 shadow-md scale-105" 
                      : "border-slate-200 bg-slate-50 hover:border-amber-300 hover:scale-[1.02]"
                  )}
                >
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/personagens/${char}`}
                    alt="Opção de Personagem"
                    fill
                    sizes="(max-width: 768px) 33vw, 25vw"
                    className="object-cover"
                  />
                  {selectedChar === char && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center shadow-sm z-10">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-95 transition-all outline-none"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 py-3 px-4 rounded-xl font-black text-white bg-[var(--color-brand)] shadow-[0_4px_0_0_var(--color-brand-shadow)] active:translate-y-1 active:shadow-none hover:brightness-110 flex items-center justify-center gap-2 outline-none uppercase tracking-wide"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salvar Adapete"}
          </button>
        </div>

      </div>
    </div>
  );
}
