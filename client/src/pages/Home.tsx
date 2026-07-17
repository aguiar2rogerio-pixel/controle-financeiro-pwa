import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { hojeISO } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Settings, Plus, Trash2, X, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { 
    movimentacoes = [], 
    categorias = [], 
    saldoFluxo, 
    saldoGiro, 
    saldoReserva,
    manutencaoPorMes,
    adicionar, 
    remover,
    executarTransferencia,
    exportarBackup,
    importarBackup
  } = useFinance();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [tipoForm, setTipoForm] = useState<"credito" | "debito">("credito");

  // Estados para os modais de histórico individual
  const [isReservaModalOpen, setIsReservaModalOpen] = useState(false);
  const [isManutencaoModalOpen, setIsManutencaoModalOpen] = useState(false);

  // Estados do formulário de lançamento
  const [tabela, setTabela] = useState<"fluxo" | "giro">("fluxo");
  const [descricao, setDescricao] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hojeISO());

  // Estados do formulário de transferência
  const [origem, setOrigem] = useState("fluxo");
  const [destino, setDestino] = useState("giro");
  const [valorTransferencia, setValorTransferencia] = useState("");

  const listaContas = [
    { id: "fluxo", nome: "Saldo Fluxo Diário" },
    { id: "giro", nome: "Capital de Giro" },
    { id: "reserva", nome: "Fundo de Reserva" }
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
    return (movimentacoes || [])
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 5);
  }, [movimentacoes]);

  // Texto do mês corrente formatado (Ex: "Julho/2026" ou "07/2026")
  const mesAnoAtualChave = useMemo(() => {
    const dataAtual = new Date();
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    return `${mes}/${dataAtual.getFullYear()}`;
  }, []);

  const mesCorrenteTexto = useMemo(() => {
    const dataAtual = new Date();
    const mes = dataAtual.toLocaleDateString('pt-BR', { month: 'long' });
    return `${mes.replace(/^\w/, (c) => c.toUpperCase())}/${dataAtual.getFullYear()}`;
  }, []);

  // 1. BLINDAGEM DA RESERVA: Filtra estritamente pela categoria "Fundo de Reserva" e apenas entradas (> 0)
  const historicoEntradasReserva = useMemo(() => {
    const categoriaReserva = categorias.find(c => c.nome.toLowerCase() === "fundo de reserva");
    return (movimentacoes || [])
      .filter(m => m.categoriaId === categoriaReserva?.id && m.valor > 0)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [movimentacoes, categorias]);

  // Agrupa as entradas da Reserva por mês para mostrar o histórico estruturado anterior
  const reservaPorMes = useMemo(() => {
    const grupos: { [key: string]: number } = {};
    historicoEntradasReserva.forEach(m => {
      const dataM = new Date(m.data);
      const mesChave = `${String(dataM.getMonth() + 1).padStart(2, '0')}/${dataM.getFullYear()}`;
      grupos[mesChave] = (grupos[mesChave] || 0) + m.valor;
    });
    return Object.entries(grupos).map(([mes, total]) => ({ mes, total }));
  }, [historicoEntradasReserva]);

  const totalAcumuladoReservaHistorico = useMemo(() => {
    return historicoEntradasReserva.reduce((sum, m) => sum + m.valor, 0);
  }, [historicoEntradasReserva]);

  // 2. CORREÇÃO DA MANUTENÇÃO: Busca o valor do mês corrente na lista ou zera se não houver registros
  const valorManutencaoMesAtual = useMemo(() => {
    const registroMes = (manutencaoPorMes || []).find(item => item.mes === mesAnoAtualChave);
    return registroMes ? Math.abs(registroMes.total) : 0;
  }, [manutencaoPorMes, mesAnoAtualChave]);

  const totalAcumuladoManutencaoHistorico = useMemo(() => {
    return (manutencaoPorMes || []).reduce((sum, item) => sum + Math.abs(item.total), 0);
  }, [manutencaoPorMes]);

  return (
    <div className="min-h-screen bg-[#12141c] text-white p-4 pb-28 font-sans">
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-100 flex items-center gap-2">
            💼 Controle Financeiro
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
              .replace(/^\w/, (c) => c.toUpperCase())}
          </p>
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

        {/* CARDS UNIFICADOS E SIMÉTRICOS: RESERVA E MANUTENÇÃO */}
        <Card className="bg-[#1e2230] border-gray-800 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-gray-800">
              
              {/* Lado da Reserva */}
              <div className="p-5 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Reserva</p>
                    <span className="text-[9px] text-gray-500 font-semibold bg-[#12141c] px-1.5 py-0.5 rounded border border-gray-800/50">{mesCorrenteTexto}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-emerald-400 mt-1.5">R$ {saldoReserva.toFixed(2).replace(".", ",")}</h2>
                </div>
                <button 
                  onClick={() => setIsReservaModalOpen(true)}
                  className="mt-4 w-full bg-[#12141c] hover:bg-[#161a26] border border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1.5 rounded-full transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar className="h-3 w-3 text-emerald-500" /> Ver Histórico
                </button>
              </div>

              {/* Lado da Manutenção */}
              <div className="p-5 flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Manutenção</p>
                    <span className="text-[9px] text-gray-500 font-semibold bg-[#12141c] px-1.5 py-0.5 rounded border border-gray-800/50">{mesCorrenteTexto}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1.5">R$ {valorManutencaoMesAtual.toFixed(2).replace(".", ",")}</h2>
                </div>
                <button 
                  onClick={() => setIsManutencaoModalOpen(true)}
                  className="mt-4 w-full bg-[#12141c] hover:bg-[#161a26] border border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-400 py-1.5 rounded-full transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar className="h-3 w-3 text-blue-500" /> Ver Histórico
                </button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botões Administrativos */}
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
              const isTransferencia = cat?.tipo === "transferencia" || m.categoriaId === "cat-transferencia";
              
              let corValor = isCredito ? "text-emerald-400" : "text-rose-400";
              let sinal = isCredito ? "+" : "-";
              
              // CORREÇÃO: Ajusta dinamicamente a cor e o sinal para transferências também na Home
              if (isTransferencia) {
                const ehDestino = m.descricao.includes("Transf. de");
                corValor = ehDestino ? "text-emerald-400" : "text-rose-400";
                sinal = ehDestino ? "+" : "-";
              }

              return (
                <div key={m.id} className="bg-[#1e2230] border border-gray-800/60 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl bg-[#161924] p-2 rounded-lg border border-gray-800">{cat?.emoji || "📌"}</span>
                    <div>
                      <h4 className="font-bold text-sm text-gray-200">{m.descricao}</h4>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {m.tabela === "giro" ? "Giro" : m.tabela === "reserva" ? "Reserva" : "Fluxo"} • {cat?.nome}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <span className={`text-base font-bold ${corValor}`}>
                      {sinal} R$ {m.valor.toFixed(2).replace(".", ",")}
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

      {/* BARRA INFERIOR FIXA */}
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

      {/* MODAL HISTÓRICO DE RESERVA (ENTRADAS POR MÊS) */}
      {isReservaModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-gray-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-emerald-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold text-base">
                <Calendar className="h-5 w-5" />
                <span>Histórico de Poupança (Reserva)</span>
              </div>
              <button onClick={() => setIsReservaModalOpen(false)} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
              <div className="space-y-2">
                {reservaPorMes.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#1e2230] p-3 rounded-lg border border-gray-800">
                    <span className="text-xs font-bold text-gray-300 uppercase">{item.mes}</span>
                    <span className="text-sm font-black text-emerald-400">+ R$ {item.total.toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
                {reservaPorMes.length === 0 && (
                  <p className="text-xs text-gray-500 italic text-center py-4">Nenhuma economia mensal registrada.</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-[#1e2230] border-t border-gray-800 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Guardado:</span>
              <span className="text-base font-extrabold text-emerald-400">R$ {totalAcumuladoReservaHistorico.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTÓRICO DE MANUTENÇÃO */}
      {isManutencaoModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-gray-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-blue-700 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2 font-bold text-base">
                <Calendar className="h-5 w-5" />
                <span>Histórico de Repasses (Esposa)</span>
              </div>
              <button onClick={() => setIsManutencaoModalOpen(false)} className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[350px] overflow-y-auto">
              <div className="space-y-2">
                {manutencaoPorMes.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#1e2230] p-3 rounded-lg border border-gray-800">
                    <span className="text-xs font-bold text-gray-300 uppercase">{item.mes}</span>
                    <span className="text-sm font-black text-white">R$ {Math.abs(item.total).toFixed(2).replace(".", ",")}</span>
                  </div>
                ))}
                {manutencaoPorMes.length === 0 && (
                  <p className="text-xs text-gray-500 italic text-center py-4">Nenhum repasse mensal registrado.</p>
                )}
              </div>
            </div>
            <div className="p-4 bg-[#1e2230] border-t border-gray-800 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Pago no Período:</span>
              <span className="text-base font-extrabold text-blue-400">R$ {totalAcumuladoManutencaoHistorico.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      )}

      {/* POP-UP DE TRANSFERÊNCIA */}
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
                  onChange={(e) => setValorTransferencia(e.target.value.replace(/\s/g, ""))}
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
                <Input type="text" inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value.replace(/\s/g, ""))} className="bg-[#161924] border-gray-800 text-white" />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-11 text-sm mt-2">Salvar Registro</Button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
