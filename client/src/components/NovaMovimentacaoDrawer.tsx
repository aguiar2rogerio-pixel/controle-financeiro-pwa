/**
 * NovaMovimentacaoDrawer — Drawer deslizante para adicionar nova movimentação.
 * Design: Ledger Moderno — sobe de baixo, formulário limpo, seleção de tabela primeiro.
 *
 * Agora usa categorias customizáveis com aplicação automática de sinais.
 */

import { useState } from "react";
import { useFinance, Tabela } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

import { hojeISO } from "@/lib/format";

interface NovaMovimentacaoDrawerProps {
  aberto: boolean;
  onFechar: () => void;
}

export function NovaMovimentacaoDrawer({ aberto, onFechar }: NovaMovimentacaoDrawerProps) {
  const { adicionar, obterCategoriasPorTabela } = useFinance();

  const [tabela, setTabela] = useState<Tabela>("fluxo");
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [valorStr, setValorStr] = useState("");

  const categorias = obterCategoriasPorTabela(tabela);

  function resetar() {
    setTabela("fluxo");
    setData(hojeISO());
    setDescricao("");
    setCategoriaId("");
    setValorStr("");
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
    if (!categoriaId) {
      toast.error("Selecione a categoria.");
      return;
    }
    
    // Remove qualquer espaço em branco que o teclado Samsung tenha inserido
    const valorLimpo = valorStr.replace(/\s/g, "");
    const num = parseFloat(valorLimpo.replace(",", "."));
    
    if (isNaN(num) || num <= 0) {
      toast.error("Informe um valor válido maior que zero.");
      return;
    }

    // Valor é sempre positivo; o sinal é determinado pelo tipo da categoria
    adicionar({
      tabela,
      data,
      descricao: descricao.trim(),
      categoriaId,
      valor: num,
    });

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
                  onClick={() => {
                    setTabela(t);
                    setCategoriaId("");
                  }}
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

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Categoria
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.nome} ({cat.tipo === "credito" ? "+" : "−"})
                </option>
              ))}
            </select>
          </div>

          {/* Valor (Ajustado para impedir bugs de teclado mobile) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Valor
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                value={valorStr}
                onChange={(e) => {
                  // Remove espaços em tempo real enquanto digita para evitar falhas visuais
                  setValorStr(e.target.value.replace(/\s/g, ""));
                }}
                placeholder="0,00"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
              />
              <div className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold flex items-center justify-center min-w-[60px]">
                {categoriaId && categorias.find((c) => c.id === categoriaId)?.tipo === "credito"
                  ? "+"
                  : "−"}
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              O sinal será aplicado automaticamente de acordo com o tipo da categoria.
            </p>
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

