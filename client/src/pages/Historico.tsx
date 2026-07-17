import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Edit2, Filter, DollarSign, X } from "lucide-react";
import { Link } from "wouter";

export default function Historico() {
  const { movimentacoes = [], categorias = [], remover, adicionar } = useFinance();

  // Estados dos filtros
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");

  // Estados para o Pop-up de Edição
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [editTabela, setEditTabela] = useState<"fluxo" | "giro" | "reserva">("fluxo");
  const [editDescricao, setEditDescricao] = useState("");
  const [editCategoriaId, setEditCategoriaId] = useState("");
  const [editValor, setEditValor] = useState("");
  const [editData, setEditData] = useState("");

  // Handler para remoção casada automática
  const handleDeletar = (id: string) => {
    const item = movimentacoes.find(m => m.id === id);
    const msg = item?.transferenciaId 
      ? "Este lançamento faz parte de uma transferência. Deletar este registro removerá a contraparte automaticamente. Confirma?"
      : "Tem certeza que deseja deletar este lançamento definitivamente?";

    if (confirm(msg)) {
      remover(id);
      alert("Removido com sucesso!");
    }
  };

  const abrirEdicao = (m: any) => {
    const cat = categorias.find((c) => c.id === m.categoriaId);
    if (cat?.tipo === "transferencia" || m.transferenciaId) {
      alert("Para garantir a precisão dos saldos, transferências não podem ser editadas diretamente. Por favor, delete o registro e refaça a transferência com o valor correto.");
      return;
    }

    setEditId(m.id);
    setEditTabela(m.tabela);
    setEditDescricao(m.descricao);
    setEditCategoriaId(m.categoriaId);
    setEditValor(m.valor.toString().replace(".", ","));
    setEditData(m.data);
    setIsEditOpen(true);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(editValor.replace(",", "."));
    if (!editDescricao || isNaN(valorNum) || valorNum <= 0 || !editCategoriaId) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    
    remover(editId);
    adicionar({ 
      tabela: editTabela, 
      data: editData, 
      descricao: editDescricao, 
      categoriaId: editCategoriaId, 
      valor: valorNum 
    });

    setIsEditOpen(false);
    alert("Lançamento updated com sucesso!");
  };

  const categoriasEdicaoFiltradas = useMemo(() => {
    const itemAntigo = movimentacoes.find(m => m.id === editId);
    const catAntiga = categorias.find(c => c.id === itemAntigo?.categoriaId);
    return categorias.filter(c => c.tipo === catAntiga?.tipo);
  }, [categorias, editId, movimentacoes]);

  // Lógica de filtragem robusta
  const movimentacoesFiltradas = useMemo(() => {
    return (movimentacoes || [])
      .filter((m) => {
        const cat = categorias.find((c) => c.id === m.categoriaId);
        
        if (filtroCategoria !== "todos" && m.categoriaId !== filtroCategoria) return false;
        
        // CORREÇÃO: Identifica dinamicamente se a transferência age como crédito (entrada) ou débito (saída) para os filtros por Tipo
        const ehTransferencia = cat?.tipo === "transferencia" || m.categoriaId === "cat-transferencia";
        let tipoReal = cat?.tipo;
        
        if (ehTransferencia) {
          tipoReal = m.descricao.includes("Transf. de") ? "credito" : "debito";
        }

        if (filtroTipo === "credito" && tipoReal !== "credito") return false;
        if (filtroTipo === "debito" && tipoReal !== "debito") return false;
        if (filtroTipo === "todos" && ehTransferencia && filtroCategoria === "todos") return true;
        
        const dataLancamento = new Date(m.data + 'T00:00:00');
        const inicioPeriodo = dataInicial ? new Date(dataInicial + 'T00:00:00') : null;
        const fimPeriodo = dataFinal ? new Date(dataFinal + 'T23:59:59') : null;

        if (inicioPeriodo && dataLancamento < inicioPeriodo) return false;
        if (fimPeriodo && dataLancamento > fimPeriodo) return false;

        return true;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [movimentacoes, categorias, filtroCategoria, filtroTipo, dataInicial, dataFinal]);

  // TOTALIZADOR DO FILTRO CORRIGIDO: Olha a descrição real para somar ou subtrair
  const saldoFiltrado = useMemo(() => {
    return movimentacoesFiltradas.reduce((acc, m) => {
      const cat = categorias.find((c) => c.id === m.categoriaId);
      
      if (cat?.tipo === "transferencia" || m.categoriaId === "cat-transferencia") {
        return m.descricao.includes("Transf. para") ? acc - m.valor : acc + m.valor;
      }
      
      return cat?.tipo === "credito" ? acc + m.valor : acc - m.valor;
    }, 0);
  }, [movimentacoesFiltradas, categorias]);

  return (
    <div className="min-h-screen bg-[#12141c] text-white p-4 pb-12 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full bg-[#1e2230]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Histórico Geral</h1>
          <p className="text-xs text-gray-500">Listagem consolidada de lançamentos</p>
        </div>
      </div>

      {/* Painel de Filtros */}
      <div className="bg-[#1e2230] border border-gray-800 rounded-xl p-4 space-y-3 mb-6 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          <Filter className="h-3.5 w-3.5 text-blue-400" />
          <span>Filtrar Lançamentos</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 text-gray-100 text-sm font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="todos">🗂️ Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 text-gray-100 text-sm font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="todos">📊 Todos os Fluxos</option>
              <option value="credito">🟢 Entradas</option>
              <option value="debito">🔴 Saídas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Filtrar por Período</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 pl-8 text-xs font-semibold text-gray-100"
              />
              <span className="absolute left-2.5 top-3 text-[10px] text-gray-500 font-bold">DE:</span>
            </div>
            <div className="relative">
              <input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 pl-9 text-xs font-semibold text-gray-100"
              />
              <span className="absolute left-2.5 top-3 text-[10px] text-gray-500 font-bold">ATÉ:</span>
            </div>
          </div>
        </div>

        {(dataInicial || dataFinal) && (
          <Button 
            onClick={() => { setDataInicial(""); setDataFinal(""); }} 
            variant="ghost" 
            className="w-full h-8 text-xs text-rose-400 hover:text-white bg-rose-500/10 rounded-lg"
          >
            Limpar Filtro de Período
          </Button>
        )}
      </div>

      {/* Card de Saldo Filtrado */}
      <div className="bg-[#1e2230] border border-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between shadow-md">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Saldo do Filtro Atual</p>
          <h2 className={`text-2xl font-black mt-0.5 ${saldoFiltrado >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            R$ {saldoFiltrado.toFixed(2).replace(".", ",")}
          </h2>
        </div>
        <div className={`p-2.5 rounded-lg border ${saldoFiltrado >= 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
          <DollarSign className="h-5 w-5" />
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
          Lançamentos Encontrados ({movimentacoesFiltradas.length})
        </h3>

        {movimentacoesFiltradas.length === 0 ? (
          <div className="bg-[#1e2230] border border-gray-800/50 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500">Nenhum lançamento no período selecionado.</p>
          </div>
        ) : (
          movimentacoesFiltradas.map((m) => {
            const cat = categorias.find((c) => c.id === m.categoriaId);
            const isCredito = cat?.tipo === "credito";
            const isTransferencia = cat?.tipo === "transferencia" || m.categoriaId === "cat-transferencia";
            const [ano, mes, dia] = m.data.split("-");
            const dataFormatada = dia && mes ? `${dia}/${mes}` : m.data;

            let corValor = isCredito ? "text-emerald-400" : "text-rose-400";
            let sinal = isCredito ? "+" : "-";
            
            // CORREÇÃO: Altera a cor e o sinal dinamicamente baseado no sentido da transferência (para/de)
            if (isTransferencia) {
              const ehDestino = m.descricao.includes("Transf. de");
              corValor = ehDestino ? "text-emerald-400" : "text-rose-400";
              sinal = ehDestino ? "+" : "-";
            }

            return (
              <div key={m.id} className="bg-[#1e2230] border border-gray-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-[#12141c] p-2 rounded-lg border border-gray-800">{cat?.emoji || "📌"}</span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{m.descricao}</h4>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {dataFormatada} • {m.tabela === "giro" ? "Capital de Giro" : m.tabela === "reserva" ? "Fundo de Reserva" : "Fluxo Diário"} • {cat?.nome}
                      </p>
                    </div>
                  </div>
                  <span className={`text-base font-black ${corValor}`}>
                    {sinal} R$ {m.valor.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800/40">
                  {!m.transferenciaId && (
                    <Button
                      onClick={() => abrirEdicao(m)}
                      variant="ghost"
                      className="h-9 px-4 bg-blue-500/10 hover:bg-blue-600 hover:text-white text-blue-400 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDeletar(m.id)}
                    variant="ghost"
                    className="h-9 px-4 bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Deletar
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POP-UP / MODAL DE EDIÇÃO REAL */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e2230] border border-gray-800 w-full max-w-sm rounded-xl p-5 shadow-2xl relative">
            <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-100">✏️ Editar Lançamento</h2>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Fluxo Destinado</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={editTabela === "fluxo" ? "default" : "outline"} onClick={() => setEditTabela("fluxo")} className="h-9 text-xs">Fluxo Diário</Button>
                  <Button type="button" variant={editTabela === "giro" ? "default" : "outline"} onClick={() => setEditTabela("giro")} className="h-9 text-xs">Capital de Giro</Button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Data</label>
                <Input type="date" value={editData} onChange={(e) => setEditData(e.target.value)} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Descrição</label>
                <Input type="text" value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Categoria</label>
                <select value={editCategoriaId} onChange={(e) => setEditCategoriaId(e.target.value)} className="w-full bg-[#161924] border border-gray-800 rounded-lg p-2.5 text-white text-sm">
                  {categoriasEdicaoFiltradas.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Valor (R$)</label>
                <Input type="text" inputMode="decimal" value={editValor} onChange={(e) => setEditValor(e.target.value.replace(/\s/g, ""))} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-11 text-sm mt-2">Salvar Alterações</Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
