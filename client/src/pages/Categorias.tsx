import React, { useState } from "react";
import { useFinance, Categoria, TipoCategoria } from "@/contexts/FinanceContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function Categorias() {
  const { categorias, adicionarCategoria, editarCategoria, removerCategoria } = useFinance();
  
  // Estados para nova categoria
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState<TipoCategoria>("debito");
  const [novoEmoji, setNovoEmoji] = useState("📌");

  // Estados para edição de categoria existente
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<Categoria | null>(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [emojiEditado, setEmojiEditado] = useState("");

  const lidarComCadastro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    
    adicionarCategoria({
      nome: novoNome.trim(),
      tipo: novoTipo,
      escopo: "ambos", // Força o padrão unificado que definimos
      emoji: novoEmoji
    });

    setNovoNome("");
    setNovoEmoji("📌");
  };

  const abrirEdicao = (cat: Categoria) => {
    setCategoriaEmEdicao(cat);
    setNomeEditado(cat.nome);
    setEmojiEditado(cat.emoji || "📌");
    setModalEditarAberto(true);
  };

  const lidarComSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaEmEdicao || !nomeEditado.trim()) return;

    editarCategoria(categoriaEmEdicao.id, {
      nome: nomeEditado.trim(),
      emoji: emojiEditado
    });

    setModalEditarAberto(false);
    setCategoriaEmEdicao(null);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-6 pb-24 text-zinc-100">
      <div>
        <h1 className="text-xl font-bold text-zinc-200">Gerenciar Categorias</h1>
        <p className="text-xs text-zinc-400">Adicione, edite ou remova categorias do seu sistema.</p>
      </div>

      {/* Formulário de Cadastro */}
      <form onSubmit={lidarComCadastro} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-md">
        <h3 className="text-sm font-bold text-zinc-300">Nova Categoria</h3>
        
        <div className="grid grid-cols-4 gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">Emoji</label>
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  type="button"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-center text-base focus:outline-none focus:border-zinc-700 w-full"
                >
                  {novoEmoji}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 p-2">
                <div className="grid grid-cols-6 gap-1">
                  {["💰", "⛽", "🔧", "👤", "🏦", "🍽️", "🚗", "📦", "⚙️", "📌", "🛒", "🏠", "📱", "🏥", "🎓", "🎮", "🍕", "✈️"].map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNovoEmoji(e)}
                      className="text-xl p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="col-span-3 flex flex-col gap-1">
            <label className="text-[10px] text-zinc-400 font-semibold uppercase">Nome da Categoria</label>
            <input 
              type="text" 
              placeholder="Ex: Farmácia, Investimentos..."
              required
              value={novoNome} 
              onChange={(e) => setNovoNome(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-zinc-400 font-semibold uppercase">Tipo de Impacto</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNovoTipo("debito")}
              className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${novoTipo === "debito" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-zinc-950 border-zinc-800 text-zinc-400"}`}
            >
              🛑 Débito (Saída)
            </button>
            <button
              type="button"
              onClick={() => setNovoTipo("credito")}
              className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${novoTipo === "credito" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-950 border-zinc-800 text-zinc-400"}`}
            >
              💰 Crédito (Entrada)
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold p-2.5 rounded-xl text-sm transition-all active:scale-98"
        >
          ➕ Criar Categoria
        </button>
      </form>

      {/* Lista de Categorias Cadastradas */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Suas Categorias</h3>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {categorias.map((cat) => (
            <div 
              key={cat.id} 
              className="flex justify-between items-center bg-zinc-900 border border-zinc-800/80 p-3 rounded-xl shadow-sm hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">{cat.emoji || "📌"}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-200">{cat.nome}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${cat.tipo === "credito" ? "text-emerald-400" : "text-red-400"}`}>
                    {cat.tipo === "credito" ? "Crédito" : "Débito"}
                  </span>
                </div>
              </div>

              {/* Botões de Ação Dinâmicos (Liberados para TODAS as categorias) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => abrirEdicao(cat)}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 rounded-lg border border-zinc-700 transition-all text-xs"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja apagar a categoria "${cat.nome}"?`)) {
                      removerCategoria(cat.id);
                    }
                  }}
                  className="p-2 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 active:scale-95 text-red-400 rounded-lg transition-all text-xs"
                  title="Excluir"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MODAL DE EDIÇÃO DE CATEGORIA ─── */}
      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent className="bg-zinc-900 border border-zinc-800 text-zinc-100 max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-zinc-200">
              ✏️ Editar Categoria
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={lidarComSalvarEdicao} className="space-y-4 pt-2">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Emoji</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      type="button"
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-center text-base focus:outline-none focus:border-zinc-700 w-full"
                    >
                      {emojiEditado}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 p-2">
                    <div className="grid grid-cols-6 gap-1">
                      {["💰", "⛽", "🔧", "👤", "🏦", "🍽️", "🚗", "📦", "⚙️", "📌", "🛒", "🏠", "📱", "🏥", "🎓", "🎮", "🍕", "✈️"].map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmojiEditado(e)}
                          className="text-xl p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-3 flex flex-col gap-1">
                <label className="text-[10px] text-zinc-400 font-semibold uppercase">Nome</label>
                <input 
                  type="text" 
                  required
                  value={nomeEditado} 
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-xl text-sm transition-all active:scale-98"
            >
              Salvar Alterações
            </button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

