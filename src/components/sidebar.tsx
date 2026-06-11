"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Grid2x2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profissional", label: "Profissional", icon: Trophy },
  { href: "/outros", label: "Outros Jogos", icon: Grid2x2 },
  { href: "/admin", label: "Adicionar Jogo", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col overflow-y-auto border-r border-border bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="text-lg font-bold tracking-tight">
          Meus Jogos
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-4">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-corinthians-red text-white"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-border px-6 py-4">
        <img
          src="/corinthians.png"
          alt="SCCP"
          style={{ width: 52, height: 52, objectFit: "contain", borderRadius: "50%" }}
        />
        <span className="text-sm font-bold text-corinthians-red">
          Vai, Corinthians!
        </span>
      </div>
    </aside>
  );
}
