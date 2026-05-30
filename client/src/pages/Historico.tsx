import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Calendar, Filter, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function Historico() {
  const { movimentacoes = [], categorias = [], remover } = useFinance();

  // Estados dos filtros
  const [filtroCategoria, setFiltroCategoria] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos"); // todos, credito, debito
  const [filtroData, setFiltroData] = useState("");

  // Handler para remoção real do lançamento
  const handleDeletar = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este lançamento definitivamente?")) {
      remover(id);
      alert("Lançamento removido com sucesso!");
    }
  };

  // Lógica de filtragem unificada (Geral - sem separação de fluxo/giro)
  const movimentacoesFiltradas = useMemo(() => {
    return (movimentacoes || []).filter((m) => {
      const cat = categorias.find((c) => c.id === m.categoriaId);
      
      // Filtro por Categoria
      if (filtroCategoria !== "todos" && m.categoriaId !== filtroCategoria) {
        return false;
      }

      // Filtro por Tipo (Entrada/Saída)
      if (filtroTipo !== "todos" && cat?.tipo !== filtroTipo) {
        return false;
      }

      // Filtro por Data
      if (filtroData && m.data !== filtroData) {
        return false;
      }

      return true;
    });
  }, [movimentacoes, categorias, filtroCategoria, filtroTipo, filtroData]);

  // Cálculo do Saldo Filtrado Realista
  const saldoFiltrado = useMemo(() => {
    return movimentacoesFiltradas.reduce((acc, m) => {
      const cat = categorias.find((c) => c.id === m.categoriaId);
      if (cat?.tipo === "credito") {
        return acc + m.valor;
      } else {
        return acc - m.valor;
      }
    }, 0);
  }, [movimentacoesFiltradas, categorias]);

  return (
    <div className="min-h-screen bg-[#12141c] text-white p-4 font-sans">
      
      {/* Cabeçalho de Navegação */}
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

      {/* Painel de Filtros com Alto Contraste (Fácil leitura no celular) */}
      <div className="bg-[#1e2230] border border-gray-800 rounded-xl p-4 space-y-3 mb-6 shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          <Filter className="h-3.5 w-3.5 text-blue-400" />
          <span>Filtrar Lançamentos</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Seletor de Categoria */}
          <div>
            <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Categoria</label>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 text-gray-100 text-sm font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="todos">🗂️ Todas</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Seletor de Tipo */}
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

        {/* Seletor de Data */}
        <div>
          <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Filtrar por Dia</label>
          <div className="relative">
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full bg-[#12141c] border border-gray-700 rounded-lg p-2.5 pl-9 text-gray-100 text-sm font-semibold focus:outline-none focus:border-blue-500"
            />
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Botão para limpar a data se selecionada */}
        {filtroData && (
          <Button 
            onClick={() => setFiltroData("")} 
            variant="ghost" 
            className="w-full h-8 text-xs text-rose-400 hover:text-white bg-rose-500/10 rounded-lg"
          >
            Limpar Filtro de Data
          </Button>
        )}
      </div>

      {/* Card de Saldo Filtrado Realista */}
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
            <p className="text-sm text-gray-500">Nenhum lançamento corresponde aos filtros aplicados.</p>
          </div>
        ) : (
          movimentacoesFiltradas.map((m) => {
            const cat = categorias.find((c) => c.id === m.categoriaId);
            const isCredito = cat?.tipo === "credito";
            
            // Formatando a data de AAAA-MM-DD para DD/MM
            const [ano, mes, dia] = m.data.split("-");
            const dataFormatada = dia && mes ? `${dia}/${mes}` : m.data;

            return (
              <div key={m.id} className="bg-[#1e2230] border border-gray-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg bg-[#12141c] p-2 rounded-lg border border-gray-800">{cat?.emoji || "📌"}</span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{m.descricao}</h4>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {dataFormatada} • {m.tabela === "giro" ? "Capital de Giro" : "Fluxo Diário"} • {cat?.nome}
                      </p>
                    </div>
                  </div>
                  <span className={`text-base font-black ${isCredito ? "text-emerald-400" : "text-rose-400"}`}>
                    {isCredito ? "+" : "-"} R$ {m.valor.toFixed(2).replace(".", ",")}
                  </span>
                </div>

                {/* Painel de Ações */}
                <div className="flex justify-end gap-2 pt-1 border-t border-gray-800/40">
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

    </div>
  );
}

