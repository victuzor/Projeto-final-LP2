import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  Coins,
  Home,
  Loader2,
  PackageSearch,
  Plus,
  ReceiptText,
  ShoppingBasket,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { api } from "./services/api";
import type {
  DashboardResponse,
  MarketComparisonResponse,
  MarketResponse,
  PantryItemResponse,
  ProductResponse,
  PurchaseFormItem,
  PurchaseResponse,
  SmartListItemResponse,
} from "./types";
import "./App.css";

type ActiveTab = "home" | "pantry" | "list" | "purchase";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [expiringItems, setExpiringItems] = useState<PantryItemResponse[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItemResponse[]>([]);
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [smartList, setSmartList] = useState<SmartListItemResponse[]>([]);
  const [marketComparison, setMarketComparison] = useState<MarketComparisonResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [markets, setMarkets] = useState<MarketResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState("");

  const [purchaseItems, setPurchaseItems] = useState<PurchaseFormItem[]>([]);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [formMessage, setFormMessage] = useState("");

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
          marketsResponse,
          productsResponse,
        ] = await Promise.all([
          api.get<DashboardResponse>("/dashboard/monthly-summary"),
          api.get<PantryItemResponse[]>("/pantry/expiring?days=7"),
          api.get<PantryItemResponse[]>("/pantry"),
          api.get<PurchaseResponse[]>("/purchases"),
          api.get<SmartListItemResponse[]>("/smart-list"),
          api.get<MarketComparisonResponse[]>("/smart-list/market-comparison"),
          api.get<MarketResponse[]>("/markets"),
          api.get<ProductResponse[]>("/products"),
        ]);

        setDashboard(dashboardResponse.data);
        setExpiringItems(expiringResponse.data);
        setPantryItems(pantryResponse.data);
        setPurchases(purchasesResponse.data);
        setSmartList(smartListResponse.data);
        setMarketComparison(comparisonResponse.data);
        setMarkets(marketsResponse.data);
        setProducts(productsResponse.data);

        if (marketsResponse.data.length > 0) {
          setSelectedMarketId(String(marketsResponse.data[0].id));
        }

        if (productsResponse.data.length > 0) {
          setSelectedProductId(String(productsResponse.data[0].id));
        }
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

  async function refreshData() {
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
  }

  function addPurchaseItem() {
    setFormMessage("");

    const product = products.find((item) => item.id === Number(selectedProductId));

    if (!product) {
      setFormMessage("Selecione um produto válido.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setFormMessage("Informe uma quantidade válida.");
      return;
    }

    if (!unitPrice || Number(unitPrice) <= 0) {
      setFormMessage("Informe um preço unitário válido.");
      return;
    }

    const newItem: PurchaseFormItem = {
      productId: product.id,
      productName: product.name,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      expirationDate,
    };

    setPurchaseItems((currentItems) => [...currentItems, newItem]);
    setQuantity("1");
    setUnitPrice("");
    setExpirationDate("");
  }

  function removePurchaseItem(indexToRemove: number) {
    setPurchaseItems((currentItems) =>
      currentItems.filter((_, index) => index !== indexToRemove)
    );
  }

  async function submitPurchase() {
    setFormMessage("");

    if (!selectedMarketId) {
      setFormMessage("Selecione um mercado.");
      return;
    }

    if (!purchaseDate) {
      setFormMessage("Informe a data da compra.");
      return;
    }

    if (purchaseItems.length === 0) {
      setFormMessage("Adicione pelo menos um item à compra.");
      return;
    }

    try {
      setSavingPurchase(true);

      await api.post("/purchases", {
        marketId: Number(selectedMarketId),
        purchaseDate,
        items: purchaseItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          expirationDate: item.expirationDate || null,
        })),
      });

      setPurchaseItems([]);
      setFormMessage("Compra registrada com sucesso.");
      await refreshData();
      setActiveTab("pantry");
    } catch (error) {
      console.error("Erro ao registrar compra", error);
      setFormMessage("Não foi possível registrar a compra.");
    } finally {
      setSavingPurchase(false);
    }
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

        {activeTab === "purchase" && (
          <>
            <section className="screen-header">
              <p>Nova compra</p>
              <h2>Registrar itens no MarketMenu</h2>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Compra</p>
                  <h2>Dados principais</h2>
                </div>
                <ReceiptText size={22} />
              </div>

              <div className="form-grid">
                <label>
                  Mercado
                  <select
                    value={selectedMarketId}
                    onChange={(event) => setSelectedMarketId(event.target.value)}
                  >
                    {markets.map((market) => (
                      <option key={market.id} value={market.id}>
                        {market.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Data da compra
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(event) => setPurchaseDate(event.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Itens</p>
                  <h2>Adicionar produto</h2>
                </div>
                <ShoppingCart size={22} />
              </div>

              <div className="form-grid">
                <label>
                  Produto
                  <select
                    value={selectedProductId}
                    onChange={(event) => setSelectedProductId(event.target.value)}
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Quantidade
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                  />
                </label>

                <label>
                  Preço unitário
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={unitPrice}
                    onChange={(event) => setUnitPrice(event.target.value)}
                    placeholder="Ex: 6.49"
                  />
                </label>

                <label>
                  Validade
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(event) => setExpirationDate(event.target.value)}
                  />
                </label>
              </div>

              <button className="primary-action" onClick={addPurchaseItem}>
                <Plus size={18} />
                Adicionar item
              </button>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Resumo</p>
                  <h2>Itens da compra</h2>
                </div>
                <ShoppingBasket size={22} />
              </div>

              {purchaseItems.length === 0 ? (
                <p className="empty">Nenhum item adicionado ainda.</p>
              ) : (
                <div className="list">
                  {purchaseItems.map((item, index) => (
                    <article key={`${item.productId}-${index}`} className="list-item">
                      <div>
                        <strong>{item.productName}</strong>
                        <span>
                          {item.quantity}x • {formatCurrency(item.unitPrice)} cada
                        </span>
                      </div>

                      <button
                        className="icon-button"
                        onClick={() => removePurchaseItem(index)}
                        aria-label="Remover item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </article>
                  ))}
                </div>
              )}

              {formMessage && <p className="form-message">{formMessage}</p>}

              <button
                className="submit-action"
                onClick={submitPurchase}
                disabled={savingPurchase}
              >
                {savingPurchase ? "Salvando..." : "Registrar compra"}
              </button>
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

          <button
            className={activeTab === "purchase" ? "active" : ""}
            onClick={() => setActiveTab("purchase")}
          >
            Compra
          </button>
        </nav>
      </section>
    </main>
  );
}

export default App;