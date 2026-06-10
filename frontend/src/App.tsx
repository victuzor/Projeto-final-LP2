import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Coins,
  Home,
  Loader2,
  PackageSearch,
  ReceiptText,
  ShoppingBasket,
  ShoppingCart,
} from "lucide-react";
import { api } from "./services/api";
import type {
  DashboardResponse,
  MarketComparisonResponse,
  PantryItemResponse,
  PurchaseResponse,
  SmartListItemResponse,
} from "./types";
import "./App.css";

type ActiveTab = "home" | "pantry" | "list";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [expiringItems, setExpiringItems] = useState<PantryItemResponse[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItemResponse[]>([]);
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [smartList, setSmartList] = useState<SmartListItemResponse[]>([]);
  const [marketComparison, setMarketComparison] = useState<MarketComparisonResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          dashboardResponse,
          expiringResponse,
          pantryResponse,
          purchasesResponse,
          smartListResponse,
          comparisonResponse,
        ] = await Promise.all([
          api.get<DashboardResponse>("/dashboard/monthly-summary"),
          api.get<PantryItemResponse[]>("/pantry/expiring?days=7"),
          api.get<PantryItemResponse[]>("/pantry"),
          api.get<PurchaseResponse[]>("/purchases"),
          api.get<SmartListItemResponse[]>("/smart-list"),
          api.get<MarketComparisonResponse[]>("/smart-list/market-comparison"),
        ]);

        setDashboard(dashboardResponse.data);
        setExpiringItems(expiringResponse.data);
        setPantryItems(pantryResponse.data);
        setPurchases(purchasesResponse.data);
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

  function formatDate(date: string | null) {
    if (!date) {
      return "Sem validade";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR");
  }

  function getStatusLabel(status: string) {
    if (status === "VENCIDO") return "vencido";
    if (status === "VENCE_EM_BREVE") return "usar logo";
    if (status === "SEM_VALIDADE") return "sem validade";
    return "ok";
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

        {activeTab === "home" && (
          <>
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
          </>
        )}

        {activeTab === "pantry" && (
          <>
            <section className="screen-header">
              <p>Despensa e extrato</p>
              <h2>Controle sem planilha</h2>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Despensa</p>
                  <h2>Itens cadastrados</h2>
                </div>
                <PackageSearch size={22} />
              </div>

              {pantryItems.length === 0 ? (
                <p className="empty">Nenhum item na despensa.</p>
              ) : (
                <div className="list">
                  {pantryItems.map((item) => (
                    <article key={item.id} className="list-item">
                      <div>
                        <strong>{item.productName}</strong>
                        <span>
                          {item.categoryName ?? "Sem categoria"} • {item.quantity} un. •{" "}
                          {formatDate(item.expirationDate)}
                        </span>
                      </div>
                      <span className={`badge status-${item.status.toLowerCase()}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Extrato</p>
                  <h2>Últimas compras</h2>
                </div>
                <ReceiptText size={22} />
              </div>

              {purchases.length === 0 ? (
                <p className="empty">Nenhuma compra registrada.</p>
              ) : (
                <div className="list">
                  {purchases.map((purchase) => (
                    <article key={purchase.id} className="purchase-card">
                      <div className="purchase-card-header">
                        <div>
                          <strong>{purchase.marketName}</strong>
                          <span>{formatDate(purchase.purchaseDate)}</span>
                        </div>
                        <strong>{formatCurrency(purchase.totalAmount)}</strong>
                      </div>

                      <div className="purchase-items">
                        {purchase.items.map((item) => (
                          <p key={item.id}>
                            {item.quantity}x {item.productName} —{" "}
                            {formatCurrency(item.totalPrice)}
                          </p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "list" && (
          <>
            <section className="screen-header">
              <p>Lista inteligente</p>
              <h2>Comprar melhor com dados</h2>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Sugestões</p>
                  <h2>Próxima compra</h2>
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
          </>
        )}

        <nav className="bottom-nav">
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Início
          </button>

          <button
            className={activeTab === "pantry" ? "active" : ""}
            onClick={() => setActiveTab("pantry")}
          >
            Despensa
          </button>

          <button
            className={activeTab === "list" ? "active" : ""}
            onClick={() => setActiveTab("list")}
          >
            Lista
          </button>
        </nav>
      </section>
    </main>
  );
}

export default App;