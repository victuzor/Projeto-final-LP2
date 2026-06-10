import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Coins,
  Home,
  Loader2,
  ShoppingBasket,
  ShoppingCart,
} from "lucide-react";
import { api } from "./services/api";
import type {
  DashboardResponse,
  MarketComparisonResponse,
  PantryItemResponse,
  SmartListItemResponse,
} from "./types";
import "./App.css";

function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [expiringItems, setExpiringItems] = useState<PantryItemResponse[]>([]);
  const [smartList, setSmartList] = useState<SmartListItemResponse[]>([]);
  const [marketComparison, setMarketComparison] = useState<MarketComparisonResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dashboardResponse,
          expiringResponse,
          smartListResponse,
          comparisonResponse,
        ] = await Promise.all([
          api.get<DashboardResponse>("/dashboard/monthly-summary"),
          api.get<PantryItemResponse[]>("/pantry/expiring?days=7"),
          api.get<SmartListItemResponse[]>("/smart-list"),
          api.get<MarketComparisonResponse[]>("/smart-list/market-comparison"),
        ]);

        setDashboard(dashboardResponse.data);
        setExpiringItems(expiringResponse.data);
        setSmartList(smartListResponse.data);
        setMarketComparison(comparisonResponse.data);
      } catch (error) {
        console.error("Erro ao carregar dados do MarketMenu", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function formatCurrency(value: number | null | undefined) {
    if (value === null || value === undefined) {
      return "R$ 0,00";
    }

    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  if (loading) {
    return (
      <main className="app loading-screen">
        <Loader2 className="spinner" size={36} />
        <p>Carregando MarketMenu...</p>
      </main>
    );
  }

  return (
    <main className="app">
      <section className="phone">
        <header className="hero">
          <div>
            <p className="eyebrow">MarketMenu</p>
            <h1>Sua despensa inteligente</h1>
            <p className="subtitle">
              Controle gastos, validade e compras em uma visão rápida.
            </p>
          </div>

          <div className="hero-icon">
            <ShoppingBasket size={30} />
          </div>
        </header>

        <section className="spent-card">
          <div>
            <p>Gastos do mês</p>
            <strong>{formatCurrency(dashboard?.monthlySpent)}</strong>
            <span>{dashboard?.purchasesInMonth ?? 0} compras registradas</span>
          </div>
          <ChevronRight size={24} />
        </section>

        <section className="summary-grid">
          <article className="summary-card">
            <Home size={22} />
            <strong>{dashboard?.pantryItemsCount ?? 0}</strong>
            <span>itens na despensa</span>
          </article>

          <article className="summary-card warning">
            <CalendarClock size={22} />
            <strong>{dashboard?.expiringSoonCount ?? 0}</strong>
            <span>vencendo em breve</span>
          </article>

          <article className="summary-card danger">
            <AlertTriangle size={22} />
            <strong>{dashboard?.expiredItemsCount ?? 0}</strong>
            <span>vencidos</span>
          </article>
        </section>

        <section className="content-card">
          <div className="section-title">
            <div>
              <p>Prioridade</p>
              <h2>Vencendo nos próximos dias</h2>
            </div>
            <AlertTriangle size={22} />
          </div>

          {expiringItems.length === 0 ? (
            <p className="empty">Nenhum item vencendo nos próximos 7 dias.</p>
          ) : (
            <div className="list">
              {expiringItems.map((item) => (
                <article key={item.id} className="list-item">
                  <div>
                    <strong>{item.productName}</strong>
                    <span>
                      {item.quantity} un. • vence em {item.daysToExpire} dias
                    </span>
                  </div>
                  <span className="badge">usar logo</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="section-title">
            <div>
              <p>Lista inteligente</p>
              <h2>Sugestões para próxima compra</h2>
            </div>
            <ShoppingCart size={22} />
          </div>

          {smartList.length === 0 ? (
            <p className="empty">Nenhuma sugestão no momento.</p>
          ) : (
            <div className="list">
              {smartList.map((item) => (
                <article key={item.productId} className="list-item">
                  <div>
                    <strong>{item.productName}</strong>
                    <span>{item.reason}</span>
                  </div>
                  <span className="price">{formatCurrency(item.lastUnitPrice)}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="content-card">
          <div className="section-title">
            <div>
              <p>Mercados</p>
              <h2>Melhor cesta estimada</h2>
            </div>
            <Coins size={22} />
          </div>

          {marketComparison.length === 0 ? (
            <p className="empty">Ainda não há preços suficientes para comparar.</p>
          ) : (
            <div className="list">
              {marketComparison.map((market, index) => (
                <article
                  key={market.marketId}
                  className={index === 0 ? "market-card best" : "market-card"}
                >
                  <div>
                    <strong>{market.marketName}</strong>
                    <span>
                      {market.availableItems} itens com preço • {market.missingItems} sem preço
                    </span>
                  </div>
                  <div className="market-price">
                    {index === 0 && <small>melhor opção</small>}
                    <strong>{formatCurrency(market.estimatedTotal)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <nav className="bottom-nav">
          <button className="active">Início</button>
          <button>Despensa</button>
          <button>Lista</button>
        </nav>
      </section>
    </main>
  );
}

export default App;