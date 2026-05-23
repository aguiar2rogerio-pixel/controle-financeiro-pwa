/**
 * FinanceContext — Estado global do app de controle financeiro.
 * Design: Ledger Moderno — mobile-first, saldos em destaque, cor semântica.
 *
 * Armazena movimentações em localStorage para persistência local (PWA).
 * Duas tabelas: "fluxo" (Controle Fluxo Diário) e "giro" (Capital de Giro Operacional).
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Tabela = "fluxo" | "giro";

export interface Movimentacao {
  id: string;
  tabela: Tabela;
  data: string; // ISO date string "YYYY-MM-DD"
  descricao: string;
  grupo: string;
  valor: number; // positivo = receita, negativo = despesa
  criadoEm: number; // timestamp
}

export const GRUPOS_FLUXO = [
  "Receita",
  "Combustível",
  "Manutenção",
  "Pessoal",
  "Saldo Inicial",
  "Alimentação",
  "Transporte",
  "Outros",
];

export const GRUPOS_GIRO = [
  "Receita",
  "Fornecedor",
  "Manutenção",
  "Pessoal",
  "Saldo Inicial",
  "Operacional",
  "Outros",
];

const STORAGE_KEY = "controle_financeiro_movimentacoes";

function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function carregarDoStorage(): Movimentacao[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Movimentacao[];
  } catch {
    return [];
  }
}

function salvarNoStorage(movs: Movimentacao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movs));
}

interface FinanceContextValue {
  movimentacoes: Movimentacao[];
  adicionar: (dados: Omit<Movimentacao, "id" | "criadoEm">) => void;
  remover: (id: string) => void;
  saldoFluxo: number;
  saldoGiro: number;
  totalManutencao: number;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(() =>
    carregarDoStorage()
  );

  useEffect(() => {
    salvarNoStorage(movimentacoes);
  }, [movimentacoes]);

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

  const saldoFluxo = movimentacoes
    .filter((m) => m.tabela === "fluxo")
    .reduce((acc, m) => acc + m.valor, 0);

  const saldoGiro = movimentacoes
    .filter((m) => m.tabela === "giro")
    .reduce((acc, m) => acc + m.valor, 0);

  const totalManutencao = movimentacoes
    .filter((m) => m.grupo === "Manutenção")
    .reduce((acc, m) => acc + Math.abs(m.valor), 0);

  return (
    <FinanceContext.Provider
      value={{
        movimentacoes,
        adicionar,
        remover,
        saldoFluxo,
        saldoGiro,
        totalManutencao,
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
