import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Link } from "wouter";

export default function Historico() {
  // Puxa as variáveis reais em português do seu arquivo FinanceContext.tsx
  const { movimentacoes = [], categorias = [], remover } = useFinance();
  
  // Estados funcionais para controle dos filtros
  const [tabelaAtiva, setTabelaAtiva] = useState<"fluxo" | "giro">("fluxo");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("todos");

  // FUNCTION 1: Filtragem lógica dos dados
  const dadosFiltrados = useMemo(() => {
    return (movimentacoes || []).filter((m) => {
      if (!m) return false;
      
      // 1. Filtra pela conta ativa (fluxo ou giro)
      const matchesTabela = m.tabela === tabelaAtiva;
      
      // 2. Filtra pela categoria selecionada nos botões
      const matchesCategory = categoriaAtiva === "todos" || m.categoriaId === categoriaAtiva;
      
      // 3. Filtra pelo intervalo de datas selecionado (YYYY-MM-DD)
      const matchesDataInicial = !dataInicial || m.data >= dataInicial;
      const matchesDataFinal = !dataFinal || m.data <= dataFinal;

      return matchesTabela && matchesCategory && matchesDataInicial && matchesDataFinal;
    });
  }, [movimentacoes, tabelaAtiva, categoriaAtiva, dataInicial, dataFinal]);

  // FUNCTION 2: Cálculo matemático dinâmico do Saldo Filtrado
  const saldoFiltrado = useMemo(() => {
    return dadosFiltrados.reduce((acumulador, m) => {
      // Encontra a categoria correspondente para descobrir se é entrada (credito) ou saída (debito)
      const cat = categorias.find(c => c.id === m.categoriaId);
      if (cat?.tipo === "credito") {
        return acumulador + Number(m.valor || 0);
      } else {
        return acumulador - Number(m.valor || 0);
      }
    }, 0);
  }, [dadosFiltrados, categorias]);

  return (
    <div className="min-h-screen bg-[#12141c] text-white flex flex-col font-sans">
      
      {/* Cabeçalho */}
      <div className="bg-[#0e82a7] p-5 pt-7 pb-6 flex justify-between items-start relative">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Histórico</h1>
          <p className="text-cyan-100/80 text-sm">Visualize e filtre suas transações</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-black/10 rounded-full">
            <X className="h-7 w-7" />
          </Button>
        </Link>
      </div>

      {/* Grid de Funções */}
      <div className="p-4 space-y-4 flex-1">
        
        {/* Alternador de Conta (Fluxo / Giro) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTabelaAtiva("fluxo")}
            className={`py-3 px-4 rounded-lg font-semibold text-base border transition-all ${
              tabelaAtiva === "fluxo"
                ? "bg-[#0e82a7] border-[#0e82a7] text-white"
                : "bg-[#1e2230] border-gray-800 text-gray-300"
            }`}
          >
            Fluxo Diário
          </button>
          <button
            onClick={() => setTabelaAtiva("giro")}
            className={`py-3 px-4 rounded-lg font-semibold text-base border transition-all ${
              tabelaAtiva === "giro"
                ? "bg-[#0e82a7] border-[#0e82a7] text-white"
                : "bg-[#1e2230] border-gray-800 text-gray-300"
            }`}
          >
            Capital de Giro
          </button>
        </div>

        {/* Filtragem por Datas */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="bg-[#1e2230] border-gray-800 text-gray-400 rounded-lg text-xs h-10 px-2 uppercase"
          />
          <Input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="bg-[#1e2230] border-gray-800 text-gray-400 rounded-lg text-xs h-10 px-2 uppercase"
          />
        </div>

        {/* Botões de Seleção de Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
          <button
            onClick={() => setCategoriaAtiva("todos")}
            className={`py-2 px-4 rounded-full text-sm font-medium transition-all shrink-0 ${
              categoriaAtiva === "todos"
                ? "bg-[#0e82a7] text-white"
                : "bg-[#1e2230] border border-gray-800 text-gray-300"
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className={`py-2 px-4 rounded-full text-sm font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                categoriaAtiva === cat.id
                  ? "bg-[#0e82a7] text-white"
                  : "bg-[#1e2230] border border-gray-800 text-gray-300"
              }`}
            >
              <span>{cat.nome}</span>
            </button>
          ))}
        </div>

        {/* Painel do Saldo Filtrado Reativo */}
        <div className="bg-[#1e2230] border border-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-medium mb-1">Saldo Filtrado</p>
          <h2 className={`text-3xl font-bold tracking-tight ${saldoFiltrado >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
            {saldoFiltrado >= 0 ? "" : "-"}R$ {Math.abs(saldoFiltrado).toFixed(2).replace(".", ",")}
          </h2>
        </div>

        {/* Renderização dos Dados Filtrados */}
        <div className="space-y-4">
          {dadosFiltrados.length === 0 ? (
            <div className="bg-[#1e2230] border border-gray-800 rounded-xl py-12 text-center text-gray-400">
              Nenhuma movimentação encontrada com esses filtros.
            </div>
          ) : (
            dadosFiltrados.map((m) => {
              const cat = categorias.find((c) => c.id === m.categoriaId);
              const isCredito = cat?.tipo === "credito";
              
              let dataFormatada = "";
              if (m.data) {
                const partes = m.data.split("-");
                if (partes.length === 3) dataFormatada = `${partes[2]}/${partes[1]}`;
              }

              return (
                <div key={m.id} className="bg-[#1e2230] border border-gray-800 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs font-semibold">{dataFormatada}</p>
                      <h3 className="text-lg font-bold text-gray-100 leading-snug">{m.descricao}</h3>
                      <span className="inline-block bg-[#161924] text-xs px-2.5 py-0.5 rounded-full text-gray-400 border border-gray-800">
                        {cat?.nome || "Sem Categoria"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${isCredito ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredito ? "+" : "-"}R$ {m.valor.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>

                  {/* Gatilho funcional para remoção */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800/60">
                    <Button 
                      variant="outline" 
                      className="bg-[#1d2d54] border-none text-blue-300 font-semibold rounded-lg h-10"
                      onClick={() => alert("Função mapeada no contexto.")}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="bg-[#6b2323] border-none text-rose-200 font-semibold rounded-lg h-10"
                      onClick={() => {
                        if(confirm("Deseja realmente deletar este lançamento?")) {
                          remover(m.id);
                        }
                      }}
                    >
                      Deletar
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

