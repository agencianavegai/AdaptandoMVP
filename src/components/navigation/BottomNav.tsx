"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  // Esconder a navegação inferior em rotas de autenticação/landing
  if (pathname === "/" || pathname === "/login" || pathname === "/cadastro") {
    return null;
  }

  const navItems = [
    {
      label: "Mundo",
      icon: Globe,
      href: "/mapa",
      isActive: pathname.startsWith("/mapa") || pathname.startsWith("/trilha") || pathname.startsWith("/arena"),
    },
    {
      label: "Ranking",
      icon: Trophy,
      href: "/ranking",
      isActive: pathname.startsWith("/ranking"),
    },
    {
      label: "Perfil",
      icon: User,
      href: "/perfil",
      isActive: pathname.startsWith("/perfil"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 border-t-[3px] border-[#e5e5e5] dark:border-slate-800 px-6 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.3)] transition-colors duration-300">
      <div className="max-w-md mx-auto flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all active:scale-95",
                active ? "text-[var(--color-brand)]" : "text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-2xl transition-colors",
                  active ? "bg-orange-100 dark:bg-orange-900/30" : "bg-transparent"
                )}
              >
                <Icon
                  className={cn("w-6 h-6", active && "drop-shadow-sm")}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active ? "currentColor" : "none"}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-black",
                  active ? "text-[var(--color-brand)]" : "text-gray-400 dark:text-slate-500"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
