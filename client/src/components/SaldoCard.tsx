/**
 * SaldoCard — Cartão de saldo para o dashboard.
 * Design: Ledger Moderno — borda lateral colorida, tipografia display em destaque.
 */

import { formatarMoeda } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SaldoCardProps {
  titulo: string;
  subtitulo?: string;
  valor: number;
  tipo: "positivo" | "negativo" | "neutro" | "automatico";
  icone: React.ReactNode;
}

export function SaldoCard({ titulo, subtitulo, valor, tipo, icone }: SaldoCardProps) {
  const corEfetiva =
    tipo === "automatico"
      ? valor >= 0
        ? "positivo"
        : "negativo"
      : tipo;

  const borderColor = {
    positivo: "border-l-green-500",
    negativo: "border-l-red-500",
    neutro: "border-l-blue-500",
  }[corEfetiva];

  const valorColor = {
    positivo: "text-green-600",
    negativo: "text-red-600",
    neutro: "text-blue-700",
  }[corEfetiva];

  const bgIcon = {
    positivo: "bg-green-50 text-green-600",
    negativo: "bg-red-50 text-red-600",
    neutro: "bg-blue-50 text-blue-600",
  }[corEfetiva];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-slate-100 border-l-4 p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md active:scale-[0.98]",
        borderColor
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-xl", bgIcon)}>
        {icone}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {titulo}
        </p>
        {subtitulo && (
          <p className="text-xs text-slate-400 mb-1 truncate">{subtitulo}</p>
        )}
        <p className={cn("text-2xl font-bold leading-tight tabular-nums", valorColor)}>
          {formatarMoeda(valor)}
        </p>
      </div>
    </div>
  );
}
