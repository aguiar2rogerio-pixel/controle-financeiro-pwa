/**
 * MovimentacaoItem — Item de movimentação na lista do histórico.
 * Design: Ledger Moderno — compacto, legível, com indicador de valor colorido.
 */

import { Movimentacao } from "@/contexts/FinanceContext";
import { formatarMoeda, formatarData } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface MovimentacaoItemProps {
  mov: Movimentacao;
  onRemover: (id: string) => void;
}

const GRUPO_EMOJI: Record<string, string> = {
  Receita: "💰",
  Combustível: "⛽",
  Manutenção: "🔧",
  Pessoal: "👤",
  "Saldo Inicial": "🏦",
  Alimentação: "🍽️",
  Transporte: "🚗",
  Fornecedor: "📦",
  Operacional: "⚙️",
  Outros: "📌",
};

export function MovimentacaoItem({ mov, onRemover }: MovimentacaoItemProps) {
  const [confirmando, setConfirmando] = useState(false);
  const isPositivo = mov.valor >= 0;
  const emoji = GRUPO_EMOJI[mov.grupo] ?? "📌";

  function handleRemover() {
    if (!confirmando) {
      setConfirmando(true);
      setTimeout(() => setConfirmando(false), 2500);
      return;
    }
    onRemover(mov.id);
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99]">
      {/* Ícone do grupo */}
      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shrink-0">
        {emoji}
      </div>

      {/* Informações */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{mov.descricao}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">{formatarData(mov.data)}</span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
            {mov.grupo}
          </span>
          <span className="text-xs text-slate-300">·</span>
          <span className="text-xs text-slate-400">
            {mov.tabela === "fluxo" ? "Fluxo" : "Giro"}
          </span>
        </div>
      </div>

      {/* Valor */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={cn(
            "text-sm font-bold tabular-nums",
            isPositivo ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositivo ? "+" : ""}
          {formatarMoeda(mov.valor)}
        </span>

        <button
          onClick={handleRemover}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150",
            confirmando
              ? "bg-red-100 text-red-600 scale-110"
              : "bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-400"
          )}
          title={confirmando ? "Clique novamente para confirmar" : "Remover"}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
