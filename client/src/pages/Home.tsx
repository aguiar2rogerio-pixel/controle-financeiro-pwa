/**
 * Home — Página principal do app de controle financeiro.
 * Design: Ledger Moderno — mobile-first, saldos em destaque, FAB flutuante.
 */

import { useState, useMemo } from "react";
import { useFinance, Movimentacao } from "@/contexts/FinanceContext";
import { SaldoCard } from "@/components/SaldoCard";
import { MovimentacaoItem } from "@/components/MovimentacaoItem";
import { NovaMovimentacaoDrawer } from "@/components/NovaMovimentacaoDrawer";
import { formatarData } from "@/lib/format";
import { Plus, TrendingUp, Wallet, Wrench, PiggyBank, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { 
    movimentacoes, 
    remover, 
    saldoFluxo, 
    saldoGiro, 
    totalManutencao, 
    totalFundoReserva,
    exportarBackup,
    importarBackup 
  } = useFinance();

  const [, navigate] = useLocation();
  const [drawerAberto, setDrawerAberto] = useState(false);

  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Limita a lista da Home para exibir apenas as últimas 5 movimentações no total (fim do pergaminho)
  const ultimasMovimentacoes = useMemo(() => {
    return movimentacoes.slice(0, 5);
  }, [movimentacoes]);

  // Agrupa esses 5 últimos lançamentos por data para manter o visual bonito
  const movsPorData = useMemo(() => {
    const mapa = new Map<string, Movimentacao[]>();
    for (const m of ultimasMovimentacoes) {
      const arr = mapa.get(m.data) ?? [];
      arr.push(m);
      mapa.set(m.data, arr);
    }
    return Array.from(mapa.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [ultimasMovimentacoes]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-28 text-zinc-100">
      
      {/* Cabeçalho do App */}
      <header className="sticky top-0 z-30 bg-zinc-900/90 border-b border-zinc-800/60 backdrop-blur shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-zinc-100 leading-tight">💼 Controle Financeiro</h1>
            <p className="text-xs text-zinc-400 capitalize">{dataFormatada}</p>
          </div>
          <button onClick={() => navigate("/categorias")} className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 border border-zinc-700 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4">
        
        {/* Painel com os 4 Cards de Saldo */}
        <section className="pt-5 pb-2 space-y-3">
          <SaldoCard titulo="Saldo Fluxo Diário" valor={saldoFluxo} variante="default" icone={<TrendingUp size={20} />} />
          <SaldoCard titulo="Capital de Giro" valor={saldoGiro} variante="default" icone={<Wallet size={20} />} />
          <SaldoCard titulo="Total Manutenção" valor={totalManutencao} variante="azul" icone={<Wrench size={20} />} />
          <SaldoCard titulo="Fundo de Reserva" valor={totalFundoReserva} variante="destaque" icone={<PiggyBank size={20} />} />
        </section>

        {/* Botões de Segurança: Backup e Restauração */}
        <section className="pt-4">
          <div className="flex gap-2 mb-6">
            <button onClick={exportarBackup} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors">
              ⬇️ Fazer Backup
            </button>
            <label className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm text-center transition-colors">
              ⬆️ Restaurar
              <input type="file" className="hidden" accept=".json" onChange={(e) => e.target.files?.[0] && importarBackup(e.target.files[0])} />
            </label>
          </div>

          {/* Título da Lista com o Botão 'Ver Tudo' igual ao APK antigo */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Últimos Lançamentos</h3>
            <button 
              onClick={() => navigate("/historico")} 
              className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
            >
              Ver Tudo
            </button>
          </div>

          {/* Lista Encurtada de Itens */}
          <div className="space-y-4">
            {movsPorData.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Nenhuma movimentação registrada.</p>
            ) : (
              movsPorData.map(([data, movs]) => (
                <div key={data}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-zinc-500">{formatarData(data)}</span>
                    <div className="flex-1 h-px bg-zinc-800/40" />
                  </div>
                  <div className="space-y-2">
                    {movs.map((m) => (<MovimentacaoItem key={m.id} mov={m} onRemover={remover} />))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Botão Flutuante (FAB) para Novo Lançamento */}
      <button onClick={() => setDrawerAberto(true)} className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-900/40 flex items-center justify-center hover:bg-blue-500 active:scale-95 z-30 transition-all">
        <Plus size={28} />
      </button>

      <NovaMovimentacaoDrawer aberto={drawerAberto} onFechar={() => setDrawerAberto(false)} />
    </div>
  );
}

