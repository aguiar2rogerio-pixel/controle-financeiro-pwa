/**
 * Home — Página principal do app de controle financeiro.
 * Design: Ledger Moderno — mobile-first, saldos em destaque, FAB flutuante.
 *
 * Estrutura:
 * - Cabeçalho fixo com nome e data
 * - 3 cartões de saldo
 * - Filtros de tabela e grupo
 * - Lista de histórico
 * - FAB para nova movimentação
 */

import { useState, useMemo } from "react";
import { useFinance, Tabela, Movimentacao } from "@/contexts/FinanceContext";
import { SaldoCard } from "@/components/SaldoCard";
import { MovimentacaoItem } from "@/components/MovimentacaoItem";
import { NovaMovimentacaoDrawer } from "@/components/NovaMovimentacaoDrawer";
import { formatarData } from "@/lib/format";
import { Plus, TrendingUp, Wallet, Wrench, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TABELA_LABELS: Record<string, string> = {
  todas: "Todas",
  fluxo: "Fluxo Diário",
  giro: "Capital de Giro",
};

export default function Home() {
  const { movimentacoes, remover, saldoFluxo, saldoGiro, totalManutencao } = useFinance();
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [filtroTabela, setFiltroTabela] = useState<"todas" | Tabela>("todas");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("todos");
  const [busca, setBusca] = useState("");

  // Data de hoje formatada
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Grupos disponíveis para o filtro
  const gruposDisponiveis = useMemo(() => {
    const movsFiltradas =
      filtroTabela === "todas"
        ? movimentacoes
        : movimentacoes.filter((m) => m.tabela === filtroTabela);
    const set = new Set(movsFiltradas.map((m) => m.grupo));
    return ["todos", ...Array.from(set).sort()];
  }, [movimentacoes, filtroTabela]);

  // Movimentações filtradas
  const movsFiltradas = useMemo(() => {
    return movimentacoes.filter((m) => {
      if (filtroTabela !== "todas" && m.tabela !== filtroTabela) return false;
      if (filtroGrupo !== "todos" && m.grupo !== filtroGrupo) return false;
      if (busca.trim()) {
        const q = busca.toLowerCase();
        if (
          !m.descricao.toLowerCase().includes(q) &&
          !m.grupo.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [movimentacoes, filtroTabela, filtroGrupo, busca]);

  // Agrupar por data
  const movsPorData = useMemo(() => {
    const mapa = new Map<string, Movimentacao[]>();
    for (const m of movsFiltradas) {
      const arr = mapa.get(m.data) ?? [];
      arr.push(m);
      mapa.set(m.data, arr);
    }
    // Ordenar datas decrescente
    return Array.from(mapa.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [movsFiltradas]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              💼 Controle Financeiro
            </h1>
            <p className="text-xs text-slate-400 capitalize">{dataFormatada}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-blue-200">
            CF
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4">
        {/* Cartões de saldo */}
        <section className="pt-5 pb-2 space-y-3">
          <SaldoCard
            titulo="Saldo Fluxo Diário"
            subtitulo="Saldo acumulado para o próximo dia"
            valor={saldoFluxo}
            tipo="automatico"
            icone={<TrendingUp size={20} />}
          />
          <SaldoCard
            titulo="Capital de Giro"
            subtitulo="Saldo operacional atual"
            valor={saldoGiro}
            tipo="automatico"
            icone={<Wallet size={20} />}
          />
          <SaldoCard
            titulo="Total Manutenção"
            subtitulo="Soma de todas as movimentações de Manutenção"
            valor={totalManutencao}
            tipo="neutro"
            icone={<Wrench size={20} />}
          />
        </section>

        {/* Seção histórico */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-700">Histórico</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {movsFiltradas.length} registro{movsFiltradas.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Filtros de tabela */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {(["todas", "fluxo", "giro"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setFiltroTabela(t); setFiltroGrupo("todos"); }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all duration-150 shrink-0",
                  filtroTabela === t
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                )}
              >
                {TABELA_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Filtro de grupo */}
          {gruposDisponiveis.length > 2 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {gruposDisponiveis.map((g) => (
                <button
                  key={g}
                  onClick={() => setFiltroGrupo(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all duration-150 shrink-0",
                    filtroGrupo === g
                      ? "bg-slate-800 text-white border-slate-800"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {g === "todos" ? "Todos os grupos" : g}
                </button>
              ))}
            </div>
          )}

          {/* Busca */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição ou grupo..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Lista */}
          {movsPorData.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-sm font-semibold text-slate-400">Nenhuma movimentação encontrada</p>
              <p className="text-xs text-slate-300 mt-1">
                {movimentacoes.length === 0
                  ? "Toque no botão + para adicionar a primeira movimentação"
                  : "Tente ajustar os filtros"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {movsPorData.map(([data, movs]) => (
                <div key={data}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-slate-400">
                      {formatarData(data)}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-xs text-slate-300">
                      {movs.length} item{movs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {movs.map((m) => (
                      <MovimentacaoItem key={m.id} mov={m} onRemover={remover} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* FAB — Botão flutuante */}
      <button
        onClick={() => setDrawerAberto(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-300 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all duration-150 z-30"
        aria-label="Nova movimentação"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Drawer de nova movimentação */}
      <NovaMovimentacaoDrawer
        aberto={drawerAberto}
        onFechar={() => setDrawerAberto(false)}
      />
    </div>
  );
}
