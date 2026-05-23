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
  tipo: TipoCategoria; // "credito" (+) ou "debito" (-)
  escopo: EscopoCategoria; // Em qual(is) tabela(s) aparece
  emoji?: string;
  criadoEm: number;
}

export interface Movimentacao {
  id: string;
  tabela: Tabela;
  data: string; // ISO date string "YYYY-MM-DD"
  descricao: string;
  categoriaId: string; // Referência à categoria
  valor: number; // Sempre positivo; o sinal é determinado pelo tipo da categoria
  criadoEm: number; // timestamp
}

// Categorias padrão iniciais
const CATEGORIAS_PADRAO: Categoria[] = [
  {
    id: "cat-receita",
    nome: "Receita",
    tipo: "credito",
    escopo: "ambos",
    emoji: "💰",
    criadoEm: Date.now(),
  },
  {
    id: "cat-combustivel",
    nome: "Combustível",
    tipo: "debito",
    escopo: "fluxo",
    emoji: "⛽",
    criadoEm: Date.now(),
  },
  {
    id: "cat-manutencao",
    nome: "Manutenção",
    tipo: "debito",
    escopo: "ambos",
    emoji: "🔧",
    criadoEm: Date.now(),
  },
  {
    id: "cat-pessoal",
    nome: "Pessoal",
    tipo: "debito",
    escopo: "ambos",
    emoji: "👤",
    criadoEm: Date.now(),
  },
  {
    id: "cat-saldo-inicial",
    nome: "Saldo Inicial",
    tipo: "credito",
    escopo: "ambos",
    emoji: "🏦",
    criadoEm: Date.now(),
  },
  {
    id: "cat-alimentacao",
    nome: "Alimentação",
    tipo: "debito",
    escopo: "fluxo",
    emoji: "🍽️",
    criadoEm: Date.now(),
  },
  {
    id: "cat-transporte",
    nome: "Transporte",
    tipo: "debito",
    escopo: "fluxo",
    emoji: "🚗",
    criadoEm: Date.now(),
  },
  {
    id: "cat-fornecedor",
    nome: "Fornecedor",
    tipo: "debito",
    escopo: "giro",
    emoji: "📦",
    criadoEm: Date.now(),
  },
  {
    id: "cat-operacional",
    nome: "Operacional",
    tipo: "debito",
    escopo: "giro",
    emoji: "⚙️",
    criadoEm: Date.now(),
  },
  {
    id: "cat-fundo-reserva",
    nome: "Fundo de Reserva",
    tipo: "credito",
    escopo: "ambos",
    emoji: "🏦",
    criadoEm: Date.now(),
  },
  {
    id: "cat-outros",
    nome: "Outros",
    tipo: "debito",
    escopo: "ambos",
    emoji: "📌",
    criadoEm: Date.now(),
  },
];

const STORAGE_KEY_MOVIMENTACOES = "controle_financeiro_movimentacoes";
const STORAGE_KEY_CATEGORIAS = "controle_financeiro_categorias";

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function carregarMovimentacoes(): Movimentacao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVIMENTACOES);
    if (!raw) return [];
    return JSON.parse(raw) as Movimentacao[];
  } catch {
    return [];
  }
}

function carregarCategorias(): Categoria[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIAS);
    if (!raw) return CATEGORIAS_PADRAO;
    return JSON.parse(raw) as Categoria[];
  } catch {
    return CATEGORIAS_PADRAO;
  }
}

function salvarMovimentacoes(movs: Movimentacao[]): void {
  localStorage.setItem(STORAGE_KEY_MOVIMENTACOES, JSON.stringify(movs));
}

function salvarCategorias(cats: Categoria[]): void {
  localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(cats));
}

interface FinanceContextValue {
  // Movimentações
  movimentacoes: Movimentacao[];
  adicionar: (dados: Omit<Movimentacao, "id" | "criadoEm">) => void;
  remover: (id: string) => void;

  // Categorias
  categorias: Categoria[];
  adicionarCategoria: (dados: Omit<Categoria, "id" | "criadoEm">) => void;
  removerCategoria: (id: string) => void;
  obterCategoriasPorTabela: (tabela: Tabela) => Categoria[];
  obterCategoriaPorId: (id: string) => Categoria | undefined;

  // Saldos
  saldoFluxo: number;
  saldoGiro: number;
  totalManutencao: number;
  totalFundoReserva: number;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(() =>
    carregarMovimentacoes()
  );
  const [categorias, setCategorias] = useState<Categoria[]>(() =>
    carregarCategorias()
  );

  useEffect(() => {
    salvarMovimentacoes(movimentacoes);
  }, [movimentacoes]);

  useEffect(() => {
    salvarCategorias(categorias);
  }, [categorias]);

  const adicionar = useCallback(
    (dados: Omit<Movimentacao, "id" | "criadoEm">) => {
      const nova: Movimentacao = {
        ...dados,
        id: gerarId(),
        criadoEm: Date.now(),
      };
      setMovimentacoes((prev) => [nova, ...prev]);
    },
    []
  );

  const remover = useCallback((id: string) => {
    setMovimentacoes((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const adicionarCategoria = useCallback(
    (dados: Omit<Categoria, "id" | "criadoEm">) => {
      const nova: Categoria = {
        ...dados,
        id: gerarId(),
        criadoEm: Date.now(),
      };
      setCategorias((prev) => [nova, ...prev]);
    },
    []
  );

  const removerCategoria = useCallback((id: string) => {
    // Não remover categorias padrão
    if (id.startsWith("cat-")) return;
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const obterCategoriasPorTabela = useCallback(
    (tabela: Tabela): Categoria[] => {
      return categorias.filter(
        (c) => c.escopo === "ambos" || c.escopo === tabela
      );
    },
    [categorias]
  );

  const obterCategoriaPorId = useCallback(
    (id: string): Categoria | undefined => {
      return categorias.find((c) => c.id === id);
    },
    [categorias]
  );

  // Calcular saldos
  const saldoFluxo = movimentacoes
    .filter((m) => m.tabela === "fluxo")
    .reduce((acc, m) => {
      const categoria = obterCategoriaPorId(m.categoriaId);
      if (!categoria) return acc;
      const valor = categoria.tipo === "credito" ? m.valor : -m.valor;
      return acc + valor;
    }, 0);

  const saldoGiro = movimentacoes
    .filter((m) => m.tabela === "giro")
    .reduce((acc, m) => {
      const categoria = obterCategoriaPorId(m.categoriaId);
      if (!categoria) return acc;
      const valor = categoria.tipo === "credito" ? m.valor : -m.valor;
      return acc + valor;
    }, 0);

  const totalManutencao = movimentacoes
    .filter((m) => {
      const categoria = obterCategoriaPorId(m.categoriaId);
      return categoria?.nome === "Manutenção";
    })
    .reduce((acc, m) => acc + m.valor, 0);

  // Fundo de Reserva: soma de todas as movimentações da categoria "Fundo de Reserva" do mês atual
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

  const totalFundoReserva = movimentacoes
    .filter((m) => {
      const categoria = obterCategoriaPorId(m.categoriaId);
      return categoria?.nome === "Fundo de Reserva" && m.data.startsWith(mesAtual);
    })
    .reduce((acc, m) => acc + m.valor, 0);

  return (
    <FinanceContext.Provider
      value={{
        movimentacoes,
        adicionar,
        remover,
        categorias,
        adicionarCategoria,
        removerCategoria,
        obterCategoriasPorTabela,
        obterCategoriaPorId,
        saldoFluxo,
        saldoGiro,
        totalManutencao,
        totalFundoReserva,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  return ctx;
}
