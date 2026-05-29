import React, { useState } from "react";
import { formatarMoeda } from "@/lib/format";
import { useFinance, Tabela, Movimentacao } from "@/contexts/FinanceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SaldoCardProps {
  titulo: string;
  valor: number;
  icone: React.ReactNode;
  variante?: "default" | "destaque" | "azul";
}

export function SaldoCard({ titulo, valor, icone, variante = "default" }: SaldoCardProps) {
  const { transferirParaReserva, movimentacoes, obterCategoriaPorId } = useFinance();
  
  // Estados para controlar os modais de transferência e extrato por mês
  const [mostrarModalTransf, setMostrarModalTransf] = useState(false);
  const [mostrarModalExtrato, setMostrarModalExtrato] = useState(false);
  
  const [contaOrigem, setContaOrigem] = useState<Tabela>("fluxo");
  const [valorTransferencia, setValorTransferencia] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState<{ label: string; key: string } | null>(null);

  // Define as cores com base na variante do card
  const corBorda = variante === "destaque" ? "border-l-emerald-500" : variante === "azul" ? "border-l-blue-500" : "border-l-zinc-700";
  const corTextoValor = variante === "destaque" ? "text-emerald-400" : variante === "azul" ? "text-blue-400" : "text-zinc-100";

  // Identifica se este card é uma das reservas que ganham funções extras
  const ehReservaManutencao = titulo.toLowerCase().includes("manutenção");
  const ehFundoReserva = titulo.toLowerCase().includes("fundo");
  const ehCardExpansivel = ehReservaManutencao || ehFundoReserva;

  // Cronograma fixo de meses para amostragem e auditoria (Mai, Jun, Jul de 2026)
  const mesesCronograma = [
    { label: "MAI.", key: "2026-05" },
    { label: "JUN.", key: "2026-06" },
    { label: "JUL.", key: "2026-07" }
  ];

  // Calcula o total acumulado especificamente em um mês para este tipo de reserva
  const calcularTotalDoMes = (mesKey: string) => {
    return movimentacoes
      .filter((m) => {
        const cat = obterCategoriaPorId(m.categoriaId);
        const nomeCorreto = ehReservaManutencao ? "Manutenção" : "Fundo de Reserva";
        return cat?.nome === nomeCorreto && m.data.startsWith(mesKey);
      })
      .reduce((acc, m) => acc + m.valor, 0);
  };

  // Obtém a lista de depósitos de um mês específico para o extrato de conferência
  const obterMovimentacoesDoMes = (mesKey: string): Movimentacao[] => {
    return movimentacoes.filter((m) => {
      const cat = obterCategoriaPorId(m.categoriaId);
      const nomeCorreto = ehReservaManutencao ? "Manutenção" : "Fundo de Reserva";
      return cat?.nome === nomeCorreto && m.data.startsWith(mesKey);
    });
  };

  // Executa a transferência automática
  const lidarComTransferencia = (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valorTransferencia.replace(",", "."));
    if (isNaN(numValor) || numValor <= 0) return;

    const destinoNome = ehReservaManutencao ? "Manutenção" : "Fundo de Reserva";
    transferirParaReserva(contaOrigem, destinoNome, numValor);
    
    setValorTransferencia("");
    setMostrarModalTransf(false);
  };

  // Calcula dinamicamente as entradas totais registradas no mês vigente (Maio/2026)
  const entradasDoMesAtual = calcularTotalDoMes("2026-05");

  return (
    <div className={`w-full bg-zinc-900/90 border-l-4 ${corBorda} rounded-xl p-5 shadow-lg flex flex-col gap-4 transition-all duration-200`}>
      
      {/* Linha Superior: Ícone, Valores e Botão de Ação rápida */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-800/80 rounded-xl text-zinc-400">
            {icone}
          </div>
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{titulo}</span>
            <h2 className={`text-2xl font-bold tracking-tight ${corTextoValor}`}>{formatarMoeda(valor)}</h2>
          </div>
        </div>

        {/* Botão de transferência rápida para os cards das Reservas */}
        {ehCardExpansivel && (
          <button 
            onClick={() => setMostrarModalTransf(true)}
            className="p-2.5 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-xl transition-all duration-150 flex items-center justify-center border border-zinc-700"
            title="Transferir Saldo"
          >
            🔄
          </button>
        )}
      </div>

      {/* Painel Inferior Expandido: Cronograma e Entradas do Mês */}
      {ehCardExpansivel && (
        <div className="pt-3 border-t border-zinc-800/60 flex flex-col gap-3">
          
          {/* Indicador de Entradas do Mês */}
          <div className="flex justify-between items-center bg-zinc-950/40 px-3 py-1.5 rounded-lg border border-zinc-800/40">
            <span className="text-[11px] text-zinc-400 font-medium">ENTRADAS DO MÊS ATUAL:</span>
            <span className="text-xs font-bold text-emerald-400">{formatarMoeda(entradasDoMesAtual)}</span>
          </div>

          {/* Seção Cronograma de Meses */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2 uppercase">Cronograma de Meses</span>
            <div className="grid grid-cols-3 gap-2">
              {mesesCronograma.map((mes) => {
                const totalMes = calcularTotalDoMes(mes.key);
                return (
                  <button
                    key={mes.key}
                    onClick={() => {
                      setMesSelecionado(mes);
                      setMostrarModalExtrato(true);
                    }}
                    className="bg-zinc-950/60 hover:bg-zinc-800/80 active:scale-95 border border-zinc-800 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all duration-150"
                  >
                    <span className="text-[10px] font-bold text-zinc-400 mb-0.5">{mes.label}</span>
                    <span className="text-xs font-bold text-zinc-200">{formatarMoeda(totalMes)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 1: FORMULÁRIO DE TRANSFERÊNCIA RÁPIDA ─── */}
      <Dialog open={mostrarModalTransf} onOpenChange={setMostrarModalTransf}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-200 flex items-center gap-2">
              🔄 Transferir para {ehReservaManutencao ? "Manutenção" : "Fundo de Reserva"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={lidarComTransferencia} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Origem do Saldo:</label>
              <select 
                value={contaOrigem} 
                onChange={(e) => setContaOrigem(e.target.value as Tabela)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              >
                <option value="fluxo">Saldo Fluxo Diário</option>
                <option value="giro">Capital de Giro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400 font-medium">Valor (R$):</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0,00"
                required
                value={valorTransferencia}
                onChange={(e) => setValorTransferencia(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl text-sm transition-all active:scale-98"
            >
              Confirmar Aporte
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── MODAL 2: EXTRATO COMPLETO DE CONFERÊNCIA DO MÊS ─── */}
      <Dialog open={mostrarModalExtrato} onOpenChange={setMostrarModalExtrato}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-sm rounded-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-200">
              🔍 Depósitos de {mesSelecionado?.label} — {ehReservaManutencao ? "Manutenção" : "Fundo de Reserva"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 pt-3">
            {mesSelecionado && obterMovimentacoesDoMes(mesSelecionado.key).length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">Nenhum depósito ou transferência neste mês.</p>
            ) : (
              mesSelecionado && obterMovimentacoesDoMes(mesSelecionado.key).map((m) => (
                <div key={m.id} className="flex justify-between items-center bg-zinc-950/50 p-2.5 border border-zinc-800/60 rounded-xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-zinc-300">{m.descricao}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(m.data + "T00:00:00").toLocaleDateString('pt-BR')} — Conta: <span className="uppercase">{m.tabela}</span>
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">+{formatarMoeda(m.valor)}</span>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
