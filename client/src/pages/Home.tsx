import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Settings, Plus, Trash2, X } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { 
    movimentacoes = [], 
    categorias = [], 
    saldoFluxo, 
    saldoGiro, 
    totalManutencao, 
    totalFundoReserva, 
    adicionar, 
    remover,
    executarTransferencia,
    exportarBackup,
    importarBackup
  } = useFinance();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<"credito" | "debito">("credito");

  // Estados do formulário de lançamento
  const [tabela, setTabela] = useState<"fluxo" | "giro">("fluxo");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  // Estados do formulário de transferência (Ajustado para padrão estável inicial)
  const [origem, setOrigem] = useState("fluxo");
  const [destino, setDestino] = useState("giro");
  const [valorTransferencia, setValorTransferencia] = useState("");

  // BLINDAGEM: Lista de contas reduzida apenas para as tabelas físicas reais
  const listaContas = [
    { id: "fluxo", nome: "Saldo Fluxo Diário" },
    { id: "giro", nome: "Capital de Giro" }
  ];

  const categoriesFiltradas = useMemo(() => {
    return categorias.filter(c => c.tipo === tipoForm);
  }, [categorias, tipoForm]);

  const abrirFormulario = (tipo: "credito" | "debito") => {
    setTipoForm(tipo);
    const primeiraCat = categorias.find(c => c.tipo === tipo);
    setCategoriaId(primeiraCat ? primeiraCat.id : "");
    setDescricao("");
    setValor("");
    setIsFormOpen(true);
  };

  const handleSalvarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(valor.replace(",", "."));
    if (!descricao || isNaN(valorNum) || valorNum <= 0 || !categoriaId) {
      alert("Preencha todos os campos corretamente.");
      return;
    }
    adicionar({ tabela, data, descricao, categoriaId, valor: valorNum });
    setIsFormOpen(false);
  };

  const handleConfirmarTransferencia = () => {
    const valorNum = parseFloat(valorTransferencia.replace(",", "."));
    if (isNaN(valorNum) || valorNum <= 0) {
      alert("Por favor, insira um valor válido.");
      return;
    }
    if (origem === destino) {
      alert("A conta de origem não pode ser igual à conta de destino.");
      return;
    }
    executarTransferencia(origem, destino, valorNum);
    setValorTransferencia("");
    setIsTransferOpen(false);
    alert("Transferência realizada com sucesso!");
  };

  const ultimosLancamentos = useMemo(() => {
    return (movimentacoes || []).slice(0, 5);
  }, [movimentacoes]);

  // CORREÇÃO DOS SINAIS: Mantém exibição positiva estável nos cards de caixinha
  const exibicaoManutencao = totalManutencao * -1;
  const exibicaoReserva = totalFundoReserva * -1;

  return (
    <div className="min-h-screen bg-[#12141c] text-white p-4 pb-28 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100 flex items-center gap-2">
            💼 Controle Financeiro
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Segunda-feira, 01 de Junho</p>
        </div>
        <Link href="/Categorias">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full bg-[#1e2230]">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Grid de Saldos Principais */}
      <div className="space-y-4 mb-6">
        <Card className="bg-[#1e2230] border-gray-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Saldo Fluxo Diário</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">R$ {saldoFluxo.toFixed(2).replace(".", ",")}</h2>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1e2230] border-gray-800 shadow-xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Capital de Giro</p>
              <h2 className="text-3xl font-extrabold text-white mt-1">R$ {saldoGiro.toFixed(2).replace(".", ",")}</h2>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#1e2230] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Manutenção</p>
              <h3 className="text-xl font-bold text-white mt-1">R$ {exibicaoManutencao.toFixed(2).replace(".", ",")}</h3>
            </CardContent>
          </Card>

          <Card className="bg-[#1e2230] border-gray-800">
            <CardContent className="p-4">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Fundo de Reserva</p>
              <h3 className="text-xl font-bold text-emerald-400 mt-1">R$ {exibicaoReserva.toFixed(2).replace(".", ",")}</h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botões Administrativos e a Nova Transferência */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={exportarBackup} variant="outline" className="bg-[#1e2230] border-gray-800 text-gray-300 h-11 text-sm rounded-lg font-semibold flex items-center justify-center gap-2">
            ⬇️ Fazer Backup
          </Button>
          <Button onClick={() => document.getElementById("file-input")?.click()} className="bg-[#0e3da7] hover:bg-[#1349c2] border-none text-white h-11 text-sm rounded-lg font-semibold flex items-center justify-center gap-2">
            ⬆️ Restaurar
          </Button>
          <input 
            type="file" 
            id="file-input" 
            className="hidden" 
            accept=".json" 
            onChange={(e) => e.target.files?.[0] && importarBackup(e.target.files[0])} 
          />
        </div>

        <Button 
          onClick={() => {
            setOrigem("fluxo");
            setDestino("giro");
            setIsTransferOpen(true);
          }}
          className="w-full bg-[#1c7896] hover:bg-[#228eaf] text-white h-11 text-sm rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Transferência entre Contas
        </Button>
      </div>

      {/* Histórico Recente */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Últimos Lançamentos</h3>
          <Link href="/historico" className="text-xs text-blue-400 font-semibold hover:underline bg-[#1e2230] px-3 py-1.5 rounded-lg">
            Ver Tudo
          </Link>
        </div>

        <div className="space-y-3">
          {ultimosLancamentos.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-4">Nenhum lançamento cadastrado.</p>
          ) : (
            ultimosLancamentos.map((m) => {
              const cat = categorias.find(c => c.id === m.categoriaId);
              const isCredito = cat?.tipo === "credito";
              return (
                <div key={m.id} className="bg-[#1e2230] border border-gray-800/60 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-[#161924] p-2 rounded-lg border border-gray-800">{cat?.emoji || "📌"}</span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{m.descricao}</h4>
                      <p className="text-[10px] text-gray-500 capitalize">{m.tabela} • {cat?.nome}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`text-base font-bold ${isCredito ? "text-emerald-400" : "text-rose-400"}`}>
                      {isCredito ? "+" : "-"} R$ {m.valor.toFixed(2).replace(".", ",")}
                    </span>
                    <button onClick={() => confirm("Deletar lançamento?") && remover(m.id)} className="text-gray-600 hover:text-rose-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* BARRA INFERIOR FIXA COM OS BOTÕES DE ENTRADA E SAÍDA */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#12141c]/90 backdrop-blur-md border-t border-gray-800/80 p-4 grid grid-cols-2 gap-4 z-40 shadow-2xl">
        <Button 
          onClick={() => abrirFormulario("credito")} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> Entrada
        </Button>
        <Button 
          onClick={() => abrirFormulario("debito")} 
          className="bg-rose-600 hover:bg-rose-500 text-white h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" /> Saída
        </Button>
      </div>

      {/* POP-UP DE TRANSFERÊNCIA BLINDADO (APENAS FLUXO <-> GIRO) */}
      {isTransferOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-gray-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-[#0e82a7] p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold text-base">
                <ArrowLeftRight className="h-5 w-5" />
                <span>Transferência entre Contas</span>
              </div>
              <button onClick={() => setIsTransferOpen(false)} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Conta de Origem:</label>
                <select
                  value={origem}
                  onChange={(e) => {
                    setOrigem(e.target.value);
                    setDestino(e.target.value === "fluxo" ? "giro" : "fluxo");
                  }}
                  className="w-full bg-[#1e2230] border border-gray-800 rounded-lg p-3 text-white text-sm focus:outline-none"
                >
                  {listaContas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Conta de Destino:</label>
                <select
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  className="w-full bg-[#1e2230] border border-gray-800 rounded-lg p-3 text-white text-sm focus:outline-none"
                >
                  {listaContas.filter(c => c.id !== origem).map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase tracking-wider">Valor (R$):</label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={valorTransferencia}
                  onChange={(e) => setValorTransferencia(e.target.value)}
                  className="bg-[#1e2230] border-gray-800 text-white placeholder-gray-600 rounded-lg h-12 text-base"
                />
              </div>
              <Button onClick={handleConfirmarTransferencia} className="w-full bg-[#0e3da7] hover:bg-[#1349c2] text-white font-bold h-12 rounded-lg text-base mt-2 shadow-lg">
                Confirmar Transferência
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP DE LANÇAMENTOS PADRÃO (ENTRADA/SAÍDA) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e2230] border border-gray-800 w-full max-w-sm rounded-xl p-5 shadow-2xl relative">
            <button onClick={() => setIsFormOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-100">
              Novo Lançamento: {tipoForm === "credito" ? "🟢 Entrada" : "🔴 Saída"}
            </h2>
            <form onSubmit={handleSalvarLancamento} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Fluxo Operacional</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={tabela === "fluxo" ? "default" : "outline"} onClick={() => setTabela("fluxo")} className="h-9 text-xs">Fluxo Diário</Button>
                  <Button type="button" variant={tabela === "giro" ? "default" : "outline"} onClick={() => setTabela("giro")} className="h-9 text-xs">Capital de Giro</Button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Data</label>
                <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Descrição</label>
                <Input type="text" placeholder="Ex: Venda Shopee" value={descricao} onChange={(e) => setDescricao(e.target.value)} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Categoria</label>
                <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full bg-[#161924] border border-gray-800 rounded-lg p-2.5 text-white text-sm">
                  {categoriesFiltradas.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 block mb-1 uppercase">Valor (R$)</label>
                <Input type="text" inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-11 text-sm mt-2">Salvar Registro</Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

