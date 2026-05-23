/**
 * NovaMovimentacaoDrawer — Drawer deslizante para adicionar nova movimentação.
 * Design: Ledger Moderno — sobe de baixo, formulário limpo, seleção de tabela primeiro.
 */

import { useState } from "react";
import { useFinance, GRUPOS_FLUXO, GRUPOS_GIRO, Tabela } from "@/contexts/FinanceContext";
import { hojeISO } from "@/lib/format";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

interface NovaMovimentacaoDrawerProps {
  aberto: boolean;
  onFechar: () => void;
}

export function NovaMovimentacaoDrawer({ aberto, onFechar }: NovaMovimentacaoDrawerProps) {
  const { adicionar } = useFinance();

  const [tabela, setTabela] = useState<Tabela>("fluxo");
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState("");
  const [grupo, setGrupo] = useState("");
  const [valorStr, setValorStr] = useState("");
  const [tipoValor, setTipoValor] = useState<"positivo" | "negativo">("positivo");

  const grupos = tabela === "fluxo" ? GRUPOS_FLUXO : GRUPOS_GIRO;

  function resetar() {
    setTabela("fluxo");
    setData(hojeISO());
    setDescricao("");
    setGrupo("");
    setValorStr("");
    setTipoValor("positivo");
  }

  function fechar() {
    resetar();
    onFechar();
  }

  function salvar() {
    if (!descricao.trim()) {
      toast.error("Informe a descrição da movimentação.");
      return;
    }
    if (!grupo) {
      toast.error("Selecione o grupo.");
      return;
    }
    const num = parseFloat(valorStr.replace(",", "."));
    if (isNaN(num) || num <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }
    const valorFinal = tipoValor === "positivo" ? num : -num;
    adicionar({ tabela, data, descricao: descricao.trim(), grupo, valor: valorFinal });
    toast.success("Movimentação registrada!");
    fechar();
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          aberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={fechar}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-w-lg mx-auto",
          aberto ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Nova Movimentação</h2>
          <button
            onClick={fechar}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh] pb-8">
          {/* Seleção de tabela */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tabela
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["fluxo", "giro"] as Tabela[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTabela(t); setGrupo(""); }}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150",
                    tabela === t
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  )}
                >
                  {t === "fluxo" ? "📊 Fluxo Diário" : "💼 Capital de Giro"}
                </button>
              ))}
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Abastecimento posto Shell"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
            />
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Grupo
            </label>
            <select
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione o grupo</option>
              {grupos.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Tipo + Valor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Valor
            </label>
            <div className="flex gap-2">
              <div className="grid grid-cols-2 gap-1 shrink-0">
                <button
                  onClick={() => setTipoValor("positivo")}
                  className={cn(
                    "px-3 py-3 rounded-xl text-sm font-bold border-2 transition-all",
                    tipoValor === "positivo"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  +
                </button>
                <button
                  onClick={() => setTipoValor("negativo")}
                  className={cn(
                    "px-3 py-3 rounded-xl text-sm font-bold border-2 transition-all",
                    tipoValor === "negativo"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  −
                </button>
              </div>
              <input
                type="number"
                inputMode="decimal"
                value={valorStr}
                onChange={(e) => setValorStr(e.target.value)}
                placeholder="0,00"
                min="0"
                step="0.01"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Botão salvar */}
          <button
            onClick={salvar}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 mt-2"
          >
            <Check size={18} />
            Salvar Movimentação
          </button>
        </div>
      </div>
    </>
  );
}
