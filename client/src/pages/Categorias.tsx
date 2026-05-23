/**
 * Categorias — Página de gerenciamento de categorias customizáveis.
 * Design: Ledger Moderno — lista de categorias com opções de adicionar/remover.
 */

import { useState } from "react";
import { useFinance, TipoCategoria, EscopoCategoria } from "@/contexts/FinanceContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const EMOJIS_SUGESTOES = [
  "💰", "⛽", "🔧", "👤", "🏦", "🍽️", "🚗", "📦", "⚙️", "📌",
  "💳", "📊", "🎯", "🏪", "🚀", "💡", "🎁", "📱", "🎓", "🏥",
];

export default function Categorias() {
  const { categorias, adicionarCategoria, removerCategoria } = useFinance();
  const [, navigate] = useLocation();

  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState<TipoCategoria>("debito");
  const [escopo, setEscopo] = useState<EscopoCategoria>("ambos");
  const [emoji, setEmoji] = useState("📌");
  const [emojiSugestoes, setEmojiSugestoes] = useState(false);

  function salvarCategoria() {
    if (!nome.trim()) {
      toast.error("Informe o nome da categoria.");
      return;
    }

    // Verificar se já existe
    if (categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error("Categoria com este nome já existe.");
      return;
    }

    adicionarCategoria({
      nome: nome.trim(),
      tipo,
      escopo,
      emoji,
    });

    toast.success("Categoria criada!");
    setNome("");
    setTipo("debito");
    setEscopo("ambos");
    setEmoji("📌");
    setModalAberto(false);
  }

  function fecharModal() {
    setNome("");
    setTipo("debito");
    setEscopo("ambos");
    setEmoji("📌");
    setEmojiSugestoes(false);
    setModalAberto(false);
  }

  // Separar categorias padrão das customizadas
  const categoriasCustomizadas = categorias.filter((c) => !c.id.startsWith("cat-"));
  const categoriasPadrao = categorias.filter((c) => c.id.startsWith("cat-"));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-base font-bold text-slate-800">Categorias</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Categorias Padrão */}
        {categoriasPadrao.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Categorias Padrão
            </h2>
            <div className="space-y-2">
              {categoriasPadrao.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl shrink-0">{cat.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cat.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            cat.tipo === "credito"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {cat.tipo === "credito" ? "Crédito (+)" : "Débito (−)"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {cat.escopo === "ambos"
                            ? "Ambas"
                            : cat.escopo === "fluxo"
                              ? "Fluxo"
                              : "Giro"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Categorias Customizadas */}
        {categoriasCustomizadas.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Minhas Categorias
            </h2>
            <div className="space-y-2">
              {categoriasCustomizadas.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-2xl shrink-0">{cat.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{cat.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            cat.tipo === "credito"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {cat.tipo === "credito" ? "Crédito (+)" : "Débito (−)"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                          {cat.escopo === "ambos"
                            ? "Ambas"
                            : cat.escopo === "fluxo"
                              ? "Fluxo"
                              : "Giro"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      removerCategoria(cat.id);
                      toast.success("Categoria removida!");
                    }}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mensagem vazia */}
        {categoriasCustomizadas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-sm font-semibold text-slate-400">Nenhuma categoria customizada</p>
            <p className="text-xs text-slate-300 mt-1">Crie sua primeira categoria abaixo</p>
          </div>
        )}
      </div>

      {/* FAB — Botão flutuante */}
      <button
        onClick={() => setModalAberto(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-300 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all duration-150 z-30"
        aria-label="Nova categoria"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {/* Modal de Nova Categoria */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
          modalAberto ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={fecharModal}
      />

      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out max-w-lg mx-auto",
          modalAberto ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Nova Categoria</h2>
          <button
            onClick={fecharModal}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh] pb-8">
          {/* Emoji */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Ícone
            </label>
            <button
              onClick={() => setEmojiSugestoes(!emojiSugestoes)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-4xl flex items-center justify-center bg-white hover:bg-slate-50 transition-colors"
            >
              {emoji}
            </button>
            {emojiSugestoes && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {EMOJIS_SUGESTOES.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setEmoji(e);
                      setEmojiSugestoes(false);
                    }}
                    className="w-full aspect-square rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-2xl transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Nome
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Consultoria"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-300"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["credito", "debito"] as TipoCategoria[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150",
                    tipo === t
                      ? t === "credito"
                        ? "border-green-600 bg-green-50 text-green-700"
                        : "border-red-600 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  )}
                >
                  {t === "credito" ? "Crédito (+)" : "Débito (−)"}
                </button>
              ))}
            </div>
          </div>

          {/* Escopo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Escopo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["fluxo", "giro", "ambos"] as EscopoCategoria[]).map((e) => (
                <button
                  key={e}
                  onClick={() => setEscopo(e)}
                  className={cn(
                    "py-3 rounded-xl text-xs font-semibold border-2 transition-all duration-150",
                    escopo === e
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  )}
                >
                  {e === "fluxo" ? "Fluxo" : e === "giro" ? "Giro" : "Ambos"}
                </button>
              ))}
            </div>
          </div>

          {/* Botão salvar */}
          <button
            onClick={salvarCategoria}
            className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold text-base shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all duration-150 mt-2"
          >
            Criar Categoria
          </button>
        </div>
      </div>
    </div>
  );
}
