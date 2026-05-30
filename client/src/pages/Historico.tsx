import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { Link } from "wouter";

export default function Historico() {
  // Traduzido para as variáveis reais do seu contexto
  const { movimentacoes = [], categorias = [] } = useFinance(); 
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Filtros ajustados com a estrutura em português do app
  const filteredTransactions = useMemo(() => {
    return (movimentacoes || []).filter((m) => {
      if (!m || !m.descricao) return false;
      
      const matchesSearch = m.descricao.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || m.categoriaId === selectedCategory;
      
      // Busca o tipo (credito/debito) da categoria relacionada para fazer o filtro por tipo
      const categoriaRelacionada = categorias.find(c => c.id === m.categoriaId);
      const tipoMovimentacao = categoriaRelacionada?.tipo || "debito";
      const matchesType = selectedType === "all" || tipoMovimentacao === selectedType;
      
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [movimentacoes, categorias, search, selectedCategory, selectedType]);

  return (
    <div className="min-h-screen bg-background p-4 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Histórico Geral</h1>
      </div>

      {/* Painel de Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todos os Fluxos</option>
                <option value="credito">Entradas / Vendas</option>
                <option value="debito">Saídas / Custos</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todas</option>
                {(categorias || []).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.emoji ? `${cat.emoji} ` : ""}{cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Resultados */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <p className="text-sm text-muted-foreground">
            Encontrados: <strong>{filteredTransactions.length}</strong> lançamentos
          </p>
        </div>

        {filteredTransactions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma movimentação encontrada com esses filtros.
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((m) => {
            // Descobre o tipo de forma dinâmica para aplicar a cor certa (+ ou -)
            const cat = categorias.find(c => c.id === m.categoriaId);
            const isCredito = cat?.tipo === "credito";

            return (
              <Card key={m.id} className="overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isCredito ? (
                      <ArrowUpCircle className="h-8 w-8 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowDownCircle className="h-8 w-8 text-rose-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-sm leading-tight">{m.descricao}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {m.data ? new Date(m.data + "T12:00:00").toLocaleDateString("pt-BR") : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${isCredito ? "text-emerald-600" : "text-rose-600"}`}>
                      {isCredito ? "+" : "-"} R$ {Number(m.valor || 0).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {m.tabela}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

