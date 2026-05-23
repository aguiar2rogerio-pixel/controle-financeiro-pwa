# Ideias de Design — Controle Financeiro Pessoal PWA

## Abordagem Escolhida: "Ledger Moderno"

**Design Movement:** Material Finance — clareza funcional com toques de profundidade e hierarquia visual forte.

**Core Principles:**
1. Mobile-first absoluto: tudo pensado para polegar, cartões grandes, toque fácil.
2. Hierarquia numérica: os saldos são os protagonistas — tipografia display em destaque.
3. Cor semântica: verde para positivo, vermelho para negativo, azul-ardósia para neutro.
4. Minimalismo funcional: sem elementos decorativos desnecessários; cada pixel tem propósito.

**Color Philosophy:**
- Fundo: branco quase puro `#F8FAFC` (slate-50) — limpo, sem cansativo.
- Cartão primário: branco com sombra suave.
- Positivo: `#16A34A` (green-600).
- Negativo: `#DC2626` (red-600).
- Acento principal: `#1D4ED8` (blue-700) — botão flutuante e ações primárias.
- Texto principal: `#0F172A` (slate-900).
- Texto secundário: `#64748B` (slate-500).

**Layout Paradigm:**
- Tela única com scroll vertical; sem abas de navegação complexas.
- Cabeçalho fixo com nome do app e data atual.
- Seção de cartões de saldo em destaque no topo.
- Lista de histórico abaixo, com filtros inline.
- FAB (Floating Action Button) fixo no canto inferior direito.

**Signature Elements:**
1. Cartões de saldo com indicador colorido lateral (borda esquerda grossa verde/vermelho/azul).
2. FAB circular azul com ícone "+" e sombra elevada.
3. Chips de filtro horizontais deslizáveis para grupo/data.

**Interaction Philosophy:**
- Drawer deslizante de baixo para cima para o formulário de nova movimentação.
- Feedback imediato: toast de confirmação ao salvar.
- Transições suaves (200ms ease-out) em todos os elementos interativos.

**Animation:**
- Cartões entram com fade + slide-up (stagger 60ms).
- FAB pulsa suavemente ao carregar.
- Drawer sobe com spring (200ms).
- Itens da lista entram com fade-in sequencial.

**Typography System:**
- Display (saldos): `font-bold text-3xl` — destaque máximo.
- Títulos de cartão: `font-semibold text-sm uppercase tracking-wide text-slate-500`.
- Corpo: `font-normal text-sm text-slate-700`.
- Fonte: DM Sans (Google Fonts) — moderna, legível, sem ser genérica.
