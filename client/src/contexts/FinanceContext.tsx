/**
 * FinanceContext — Estado global do app de controle financeiro.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { hojeISO } from "@/lib/format";

export type Tabela = "fluxo" | "giro" | "reserva";
export type TipoCategoria = "credito" | "debito" | "transferencia";
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
  data: string;
  descricao: string;
  categoriaId: string;
  valor: number;
  transferenciaId?: string; // Elo de ligação para transferências casadas
  criadoEm: number;
}

const CATEGORIAS_PADRAO: Categoria[] = [
  { id: "cat-receita", nome: "Receita", tipo: "credito", escopo: "ambos", emoji: "💰", criadoEm: Date.now() },
  { id: "cat-combustivel", nome: "Combustível", tipo: "debito", escopo: "ambos", emoji: "⛽", criadoEm: Date.now() },
  { id: "cat-manutencao", nome: "Manutenção", tipo: "debito", escopo: "ambos", emoji: "🔧", criadoEm: Date.now() },
  { id: "cat-pessoal", nome: "Pessoal", tipo: "debito", escopo: "ambos", emoji: "👤", criadoEm: Date.now() },
  { id: "cat-saldo-inicial", nome: "Saldo Inicial", tipo: "credito", escopo: "ambos", emoji: "🏦", criadoEm: Date.now() },
  { id: "cat-alimentacao", nome: "Alimentação", tipo: "debito", escopo: "ambos", emoji: "🍽️", criadoEm: Date.now() },
  { id: "cat-transporte", nome: "Transporte", tipo: "debito", escopo: "ambos", emoji: "🚗", criadoEm: Date.now() },
  { id: "cat-fornecedor", nome: "Fornecedor", tipo: "debito", escopo: "ambos", emoji: "📦", criadoEm: Date.now() },
  { id: "cat-operacional", nome: "Operacional", tipo: "debito", escopo: "ambos", emoji: "⚙️", criadoEm: Date.now() },
  { id: "cat-fundo-reserva", nome: "Fundo de Reserva", tipo: "credito", escopo: "ambos", emoji: "🏦", criadoEm: Date.now() },
  { id: "cat-transferencia", nome: "Transferência Interna", tipo: "transferencia", escopo: "ambos", emoji: "🔄", criadoEm: Date.now() },
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
    if (raw) {
      const salvas: Categoria[] = JSON.parse(raw);
      return salvas.map(c => ({ ...c, escopo: "ambos" }));
    }
    return CATEGORIAS_PADRAO;
  } catch { return CATEGORIAS_PADRAO; }
}

interface FinanceContextValue {
  movimentacoes: Movimentacao[];
  adicionar: (dados: Omit<Movimentacao, "id" | "criadoEm">) => void;
  remover: (id: string) => void;
  categorias: Categoria[];
  adicionarCategoria: (dados: Omit<Categoria, "id" | "criadoEm">) => void;
  editarCategoria: (id: string, dados: Partial<Omit<Categoria, "id" | "criadoEm">>) => void;
  removerCategoria: (id: string) => void;
  obterCategoriasPorTabela: (tabela: Tabela) => Categoria[];
  obterCategoriaPorId: (id: string) => Categoria | undefined;
  saldoFluxo: number;
  saldoGiro: number;
  saldoReserva: number;
  totalManutencao: number;
  totalFundoReserva: number;
  manutencaoPorMes: { mes: string, total: number }[];
  executarTransferencia: (origem: string, destino: string, valor: number) => void;
  exportarBackup: () => void;
  importarBackup: (file: File) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>(carregarMovimentacoes);
  const [categorias, setCategorias] = useState<Categoria[]>(carregarCategorias);

  useEffect(() => {
    let houveMudanca = false;
    const novasMovimentacoes = movimentacoes.map(m => {
      if (m.data.includes("/")) {
        const [dia, mes, ano] = m.data.split("/");
        const dataNova = `${ano}-${mes}-${dia}`;
        houveMudanca = true;
        return { ...m, data: dataNova };
      }
      const partesData = m.data.split("-");
      if (partesData.length === 3) {
        const ano = partesData[0];
        const mes = partesData[1].padStart(2, '0');
        const dia = partesData[2].padStart(2, '0');
        const dataPadronizada = `${ano}-${mes}-${dia}`;
        if (dataPadronizada !== m.data) {
          houveMudanca = true;
          return { ...m, data: dataPadronizada };
        }
      }
      return m;
    });

    if (houveMudanca) {
      setMovimentacoes(novasMovimentacoes);
    }
  }, [movimentacoes]);

  useEffect(() => {
    let houveMudanca = false;

    const categoriasMapeadas = categorias.map(c => {
      const nomeLimpo = c.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const padraoCorrespondente = CATEGORIAS_PADRAO.find(cp => 
        cp.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === nomeLimpo
      );
      if (padraoCorrespondente && c.id !== padraoCorrespondente.id) {
        return { antigoId: c.id, novoId: padraoCorrespondente.id };
      }
      return null;
    }).filter(Boolean) as { antigoId: string, novoId: string }[];

    if (categoriasMapeadas.length > 0) {
      const novasMovs = movimentacoes.map(m => {
        const mapeamento = categoriasMapeadas.find(map => map.antigoId === m.categoriaId);
        if (mapeamento) {
          houveMudanca = true;
          return { ...m, categoriaId: mapeamento.novoId };
        }
        return m;
      });
      const IDsAntigos = categoriasMapeadas.map(map => map.antigoId);
      const novasCats = categorias.filter(c => !IDsAntigos.includes(c.id));

      if (houveMudanca || novasCats.length !== categorias.length) {
        setMovimentacoes(novasMovs);
        setCategorias(novasCats);
      }
    }
  }, [movimentacoes, categorias]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY_MOVIMENTACOES, JSON.stringify(movimentacoes)); }, [movimentacoes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(categorias)); }, [categorias]);

  const adicionar = useCallback((dados: Omit<Movimentacao, "id" | "criadoEm">) => {
    setMovimentacoes((prev) => [{ ...dados, id: gerarId(), criadoEm: Date.now() }, ...prev]);
  }, []);

  const remover = useCallback((id: string) => { 
    setMovimentacoes((prev) => {
      const itemAlvo = prev.find(m => m.id === id);
      if (itemAlvo && itemAlvo.transferenciaId) {
        return prev.filter((m) => m.transferenciaId !== itemAlvo.transferenciaId);
      }
      return prev.filter((m) => m.id !== id);
    }); 
  }, []);

  const adicionarCategoria = useCallback((dados: Omit<Categoria, "id" | "criadoEm">) => {
    setCategorias((prev) => [{ ...dados, id: gerarId(), escopo: "ambos", criadoEm: Date.now() }, ...prev]);
  }, []);

  const editarCategoria = useCallback((id: string, dados: Partial<Omit<Categoria, "id" | "criadoEm">>) => {
    setCategorias((prev) => prev.map((c) => c.id === id ? { ...c, ...dados, escopo: "ambos" } : c));
  }, []);

  const removerCategoria = useCallback((id: string) => {
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const obterCategoriasPorTabela = useCallback((_tabela: Tabela) => categorias, [categorias]);
  const obterCategoriaPorId = useCallback((id: string) => categorias.find((c) => c.id === id), [categorias]);

  const executarTransferencia = useCallback((origem: string, destino: string, valor: number) => {
    const dataHoje = hojeISO();
    const tokenTransf = `transf-${gerarId()}`;

    const obterTabelaFisica = (idConta: string): Tabela => {
      if (idConta === "giro") return "giro";
      if (idConta === "reserva") return "reserva";
      return "fluxo";
    };

    const nomeContaFormatado = (idConta: string) => {
      if (idConta === "fluxo") return "Fluxo Diário";
      if (idConta === "giro") return "Capital de Giro";
      return "Fundo de Reserva";
    };

    const movOrigem: Movimentacao = {
      id: gerarId(),
      tabela: obterTabelaFisica(origem),
      data: dataHoje,
      descricao: `Transf. para ${nomeContaFormatado(destino)}`,
      categoriaId: "cat-transferencia",
      valor: valor,
      transferenciaId: tokenTransf,
      criadoEm: Date.now()
    };

    const movDestino: Movimentacao = {
      id: gerarId(),
      tabela: obterTabelaFisica(destino),
      data: dataHoje,
      descricao: `Transf. de ${nomeContaFormatado(origem)}`,
      categoriaId: "cat-transferencia",
      valor: valor,
      transferenciaId: tokenTransf,
      criadoEm: Date.now()
    };

    setMovimentacoes((prev) => [movOrigem, movDestino, ...prev]);
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
          const categoriasTratadas = dados.categorias.map((c: any) => ({ ...c, escopo: "ambos" }));
          setMovimentacoes(dados.movimentacoes);
          setCategorias(categoriasTratadas);
          alert("Backup restaurado com sucesso!");
          window.location.reload();
        } else { alert("Arquivo inválido!"); }
      } catch { alert("Erro ao restaurar."); }
    };
    reader.readAsText(file);
  };

  const saldoFluxo = useMemo(() => {
    return movimentacoes
      .filter((m) => m.tabela === "fluxo")
      .reduce((acc, m) => {
        const cat = categorias.find((c) => c.id === m.categoriaId);
        if (cat?.tipo === "transferencia") {
          return m.descricao.startsWith("Transf. para") ? acc - m.valor : acc + m.valor;
        }
        return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
      }, 0);
  }, [movimentacoes, categorias]);

  const saldoGiro = useMemo(() => {
    return movimentacoes
      .filter((m) => m.tabela === "giro")
      .reduce((acc, m) => {
        const cat = categorias.find((c) => c.id === m.categoriaId);
        if (cat?.tipo === "transferencia") {
          return m.descricao.startsWith("Transf. para") ? acc - m.valor : acc + m.valor;
        }
        return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
      }, 0);
  }, [movimentacoes, categorias]);

  const saldoReserva = useMemo(() => {
    return movimentacoes
      .filter((m) => m.tabela === "reserva")
      .reduce((acc, m) => {
        const cat = categorias.find((c) => c.id === m.categoriaId);
        if (cat?.tipo === "transferencia") {
          return m.descricao.startsWith("Transf. para") ? acc - m.valor : acc + m.valor;
        }
        return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
      }, 0);
  }, [movimentacoes, categorias]);

  const totalManutencao = useMemo(() => {
    return movimentacoes.filter(m => categorias.find(c => c.id === m.categoriaId)?.nome === "Manutenção").reduce((acc, m) => {
      const cat = categorias.find(c => c.id === m.categoriaId);
      return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
    }, 0);
  }, [movimentacoes, categorias]);

  const totalFundoReserva = useMemo(() => {
    return movimentacoes.filter(m => categorias.find(c => c.id === m.categoriaId)?.nome === "Fundo de Reserva").reduce((acc, m) => {
      const cat = categorias.find(c => c.id === m.categoriaId);
      return acc + (cat?.tipo === "credito" ? m.valor : -m.valor);
    }, 0);
  }, [movimentacoes, categorias]);

  const manutencaoPorMes = useMemo(() => {
    const meses: { [key: string]: number } = {};
    movimentacoes
      .filter(m => categorias.find(c => c.id === m.categoriaId)?.nome === "Manutenção")
      .forEach(m => {
        const [ano, mes] = m.data.split("-");
        const chave = `${mes}/${ano}`;
        const cat = categorias.find(c => c.id === m.categoriaId);
        const valor = cat?.tipo === "credito" ? m.valor : -m.valor;
        meses[chave] = (meses[chave] || 0) + valor;
      });
    
    return Object.entries(meses)
      .map(([mes, total]) => ({ mes, total }))
      .sort((a, b) => {
        const [mA, aA] = a.mes.split("/");
        const [mB, aB] = b.mes.split("/");
        return new Date(parseInt(aB), parseInt(mB)-1).getTime() - new Date(parseInt(aA), parseInt(mA)-1).getTime();
      });
  }, [movimentacoes, ...categorias]);

  return (
    <FinanceContext.Provider value={{ 
      movimentacoes, adicionar, remover, categorias, adicionarCategoria, editarCategoria, removerCategoria, 
      obterCategoriasPorTabela, obterCategoriaPorId, saldoFluxo, saldoGiro, saldoReserva, totalManutencao, 
      totalFundoReserva, manutencaoPorMes, executarTransferencia, exportarBackup, importarBackup 
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
