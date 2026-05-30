import { useState, useMemo } from "react";
import { useFinance } from "@/contexts/FinanceContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react";
import { Link } from "wouter";

export default function Historico() {
  const { transactions, categories } = useFinance();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Filtros de transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "all" || t.categoryId === selectedCategory;
      const matchesType = selectedType === "all" || t.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, search, selectedCategory, selectedType]);

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
                <option value="income">Entradas / Vendas</option>
                <option value="expense">Saídas / Custos</option>
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
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
          filteredTransactions.map((t) => (
            <Card key={t.id} className="overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.type === "income" ? (
                    <ArrowUpCircle className="h-8 w-8 text-emerald-500 shrink-0" />
                  ) : (
                    <ArrowDownCircle className="h-8 w-8 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm leading-tight">{t.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(t.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "income" ? "+" : "-"} R$ {Number(t.amount).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

