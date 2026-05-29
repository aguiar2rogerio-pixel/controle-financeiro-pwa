/**
 * FinanceContext — Estado global do app de controle financeiro.
 * Design: Ledger Moderno — mobile-first, saldos em destaque, cor semântica.
 *
 * Armazena movimentações e categorias em localStorage para persistência local (PWA).
 * Duas tabelas: "fluxo" (Controle Fluxo Diário) e "giro" (Capital de Giro Operacional).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Tabela = "fluxo" | "giro";
export type TipoCategoria = "credito" | "debito";
export type EscopoCategoria = "fluxo" | "giro" | "ambos";

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoCategoria;
  escopo: EscopoCategoria;
  emoji?: string;
  criadoEm: number;
}

export interface Movimentacao {
  id: string;
  tabela: Tabela;
  data: string; // Formato "YYYY-MM-DD"
  descricao: string;
  categoriaId: string;
  valor: number;
  criadoEm: number;
}

const CATEGORIAS_PADRAO: Categoria[] = [
  { id: "cat-receita", nome: "Receita", tipo: "credito", escopo: "ambos", emoji: "💰", criadoEm: Date.now() },
  { id: "cat-combustivel", nome: "Combustível", tipo: "debito", escopo: "fluxo", emoji: "⛽", criadoEm: Date.now() },
  { id: "cat-manutencao", nome: "Manutenção", tipo: "debito", escopo: "ambos", emoji: "🔧", criadoEm: Date.now() },
  { id: "cat-pessoal", nome: "Pessoal", tipo: "debito", escopo: "ambos", emoji: "👤", criadoEm: Date.now() },
  { id: "cat-saldo-inicial", nome: "Saldo Inicial", tipo: "credito", escopo: "ambos", emoji: "🏦", criadoEm: Date.now() },
  { id: "cat-alimentacao", nome: "Alimentação", tipo: "debito", escopo: "fluxo", emoji: "🍽️", criadoEm: Date.now() },
  { id: "cat-transporte", nome: "Transporte", tipo: "debito", escopo: "fluxo", emoji: "🚗", criadoEm: Date.now() },
  { id: "cat-fornecedor", nome: "Fornecedor", tipo: "debito", escopo: "giro", emoji: "📦", criadoEm: Date.now() },
  { id: "cat-operacional", nome: "Operacional", tipo: "debito", escopo: "giro", emoji: "⚙️", criadoEm: Date.now() },
  { id: "cat-fundo-reserva", nome: "Fundo de Reserva", tipo: "credito", escopo: "ambos", emoji: "🏦", criadoEm: Date.now() },
  { id: "cat-outros", nome: "Outros", tipo: "debito", escopo: "ambos", emoji: "📌", criadoEm: Date.now() },
];

const STORAGE_KEY_MOVIMENTACOES = "controle_financeiro_movimentacoes";
const STORAGE_KEY_CATEGORIAS = "controle_financeiro_categorias";

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function carregarMovimentacoes(): Movimentacao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVIMENTACOES);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function carregarCategorias(): Categoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIAS);
    return raw ? JSON.parse(raw) : CATEGORIAS_PADRAO;
  } catch { return CATEGORIAS_PADRAO; }
}

interface FinanceContextValue {
  movimentacoes: Movimentacao[];
  adicionar: (dados: Omit<Movimentacao, "id" | "criadoEm">) => void;
  remover: (id: string) => void;
  categorias: Categoria[];
  adicionarCategoria: (dados: Omit<Categoria, "id" | "criadoEm">) => void;
  removerCategoria: (id: string) => void;
  obterCategoriasPorTabela: (tabela: Tabela) => Categoria[];
  obterCategoriaPorId: (id: string) => Categoria | undefined;
  saldoFluxo: number;
  saldoGiro: number;
  totalManutencao: number;         // Mês Atual
  totalManutencaoAnterior: number; // Mês Anterior
  totalFundoReserva: number;       // Saldo Acumulado Real Vitalício
  exportarBackup: () => void;
  importarBackup: (file: File) => void;
  transferirFundoReserva: (valor: number, destino: Tabela) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(carregarMovimentacoes);
  const [categorias, setCategorias] = useState<Categoria[]>(carregarCategorias);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_MOVIMENTACOES, JSON.stringify(movimentacoes)); }, [movimentacoes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(categorias)); }, [categorias]);

  const adicionar = useCallback((dados: Omit<Movimentacao, "id" | "criadoEm">) => {
    setMovimentacoes((prev) => [{ ...dados, id: gerarId(), criadoEm: Date.now() }, ...prev]);
  }, []);

  const remover = useCallback((id: string) => { setMovimentacoes((prev) => prev.filter((m) => m.id !== id)); }, []);

  const adicionarCategoria = useCallback((dados: Omit<Categoria, "id" | "criadoEm">) => {
    setCategorias((prev) => [{ ...dados, id: gerarId(), criadoEm: Date.now() }, ...prev]);
  }, []);

  const removerCategoria = useCallback((id: string) => {
    if (!id.startsWith("cat-")) setCategorias((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const obterCategoriasPorTabela = useCallback((tabela: Tabela) => 
    categorias.filter((c) => c.escopo === "ambos" || c.escopo === tabela), [categorias]);

  const obterCategoriaPorId = useCallback((id: string) => categorias.find((c) => c.id === id), [categorias]);

  // Função para realizar a transferência simplificada direto do Fundo de Reserva
  const transferirFundoReserva = useCallback((valor: number, destino: Tabela) => {
    if (valor <= 0) return;
    
    const hojeStr = new Date().toISOString().slice(0, 10);
    
    // 1. Lança a saída na categoria Fundo de Reserva (tabela de destino) marcando o valor negativo para abater o fundo
    const lancamentoSaida: Omit<Movimentacao, "id" | "criadoEm"> = {
      tabela: destino,
      data: hojeStr,
      descricao: `Resgate de Fundo de Reserva para ${destino === "fluxo" ? "Fluxo Diário" : "Capital de Giro"}`,
      categoriaId: "cat-fundo-reserva",
      valor: -valor, // Negativo para indicar que reduziu a reserva
    };

    // 2. Lança a entrada na categoria de Receita ou Saldo Inicial na tabela de destino para injetar o dinheiro
    const lancamentoEntrada: Omit<Movimentacao, "id" | "criadoEm"> = {
      tabela: destino,
      data: hojeStr,
      descricao: "Entrada via Resgate de Fundo de Reserva",
      categoriaId: "cat-saldo-inicial",
      valor: valor, // Positivo para somar no caixa do Fluxo/Giro
    };

    setMovimentacoes((prev) => [
      { ...lancamentoSaida, id: gerarId(), criadoEm: Date.now() },
      { ...lancamentoEntrada, id: gerarId(), criadoEm: Date.now() + 1 },
      ...prev
    ]);
  }, []);

  const exportarBackup = () => {
    const backup = { movimentacoes, categorias, data: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-financeiro-${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target?.result as string);
        if (dados.movimentacoes && dados.categorias) {
          setMovimentacoes(dados.movimentacoes);
          setCategorias(dados.categorias);
          alert("Backup restaurado com sucesso!");
          window.location.reload();
        } else { alert("Arquivo inválido!"); }
      } catch { alert("Erro ao restaurar."); }
    };
    reader.readAsText(file);
  };

  // Cálculo de saldos operacionais normais
  const saldoFluxo = movimentacoes.filter(m => m.tabela === "fluxo").reduce((acc, m) => {
    const cat = obterCategoriaPorId(m.categoriaId);
    // Se for o Fundo de Reserva sendo lançado na tabela, ele obedece estritamente o sinal do valor dele
    if (m.categoriaId === "cat-fundo-reserva") return acc; 
    return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
  }, 0);

  const saldoGiro = movimentacoes.filter(m => m.tabela === "giro").reduce((acc, m) => {
    const cat = obterCategoriaPorId(m.categoriaId);
    if (m.categoriaId === "cat-fundo-reserva") return acc;
    return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
  }, 0);

  // 🗓️ Lógica de filtro por datas (Mês Atual e Mês Anterior)
  const dataHoje = new Date();
  const mesAtualStr = dataHoje.toISOString().slice(0, 7); // ex: "2026-05"

  const dataMesAnterior = new Date(dataHoje.getFullYear(), dataHoje.getMonth() - 1, 1);
  const mesAnteriorStr = dataMesAnterior.toISOString().slice(0, 7); // ex: "2026-04"

  // Filtra Manutenção para o Mês Atual
  const totalManutencao = movimentacoes.filter(m => {
    const cat = obterCategoriaPorId(m.categoriaId);
    return cat?.id === "cat-manutencao" && m.data.startsWith(mesAtualStr);
  }).reduce((acc, m) => acc + m.valor, 0);

  // Filtra Manutenção para o Mês Anterior
  const totalManutencaoAnterior = movimentacoes.filter(m => {
    const cat = obterCategoriaPorId(m.categoriaId);
    return cat?.id === "cat-manutencao" && m.data.startsWith(mesAnteriorStr);
  }).reduce((acc, m) => acc + m.valor, 0);

  // 🏦 Fundo de Reserva Real Acumulado Vitalício (Soma créditos, abate débitos/resgastes)
  const totalFundoReserva = movimentacoes
    .filter(m => m.categoriaId === "cat-fundo-reserva")
    .reduce((acc, m) => acc + m.valor, 0);

  return (
    <FinanceContext.Provider value={{ 
      movimentacoes, adicionar, remover, 
      categorias, adicionarCategoria, removerCategoria, 
      obterCategoriasPorTabela, obterCategoriaPorId, 
      saldoFluxo, saldoGiro, 
      totalManutencao, totalManutencaoAnterior, 
      totalFundoReserva, exportarBackup, importarBackup,
      transferirFundoReserva
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  return ctx;
}

