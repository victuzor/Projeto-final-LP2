import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Home,
  Loader2,
  PackageSearch,
  Plus,
  ReceiptText,
  Search,
  ShoppingBasket,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { api } from "./services/api";
import type {
  DashboardResponse,
  MarketResponse,
  PantryItemResponse,
  ProductResponse,
  PurchaseFormItem,
  PurchaseResponse,
  ShoppingListItem,
} from "./types";
import "./App.css";

type ActiveTab = "home" | "pantry" | "extract" | "list" | "checklist" | "purchase";
type PantryFilter = "all" | "expiring" | "expired";

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [pantryFilter, setPantryFilter] = useState<PantryFilter>("all");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [expiringItems, setExpiringItems] = useState<PantryItemResponse[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItemResponse[]>([]);
  const [purchases, setPurchases] = useState<PurchaseResponse[]>([]);
  const [markets, setMarkets] = useState<MarketResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [pantryMessage, setPantryMessage] = useState("");

  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedProductId, setSelectedProductId] = useState("");
  const [purchaseProductSearch, setPurchaseProductSearch] = useState("");
  const [showPurchaseProductOptions, setShowPurchaseProductOptions] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseFormItem[]>([]);
  const [savingPurchase, setSavingPurchase] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const [productSearch, setProductSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  const autocompleteRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node)
      ) {
        setShowPurchaseProductOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function loadData() {
    try {
      const [
        dashboardResponse,
        expiringResponse,
        pantryResponse,
        purchasesResponse,
        marketsResponse,
        productsResponse,
      ] = await Promise.all([
        api.get<DashboardResponse>("/dashboard/monthly-summary"),
        api.get<PantryItemResponse[]>("/pantry/expiring?days=7"),
        api.get<PantryItemResponse[]>("/pantry"),
        api.get<PurchaseResponse[]>("/purchases"),
        api.get<MarketResponse[]>("/markets"),
        api.get<ProductResponse[]>("/products"),
      ]);

      setDashboard(dashboardResponse.data);
      setExpiringItems(expiringResponse.data);
      setPantryItems(pantryResponse.data);
      setPurchases(purchasesResponse.data);
      setMarkets(marketsResponse.data);
      setProducts(productsResponse.data);

      if (marketsResponse.data.length > 0) {
        setSelectedMarketId(String(marketsResponse.data[0].id));
      }

      if (productsResponse.data.length > 0) {
        const firstProduct = productsResponse.data[0];

        setSelectedProductId(String(firstProduct.id));
        setPurchaseProductSearch(firstProduct.name);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do MarketMenu", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const productCategories = products
      .map((product) => product.categoryName)
      .filter((category): category is string => Boolean(category));

    return ["Todas", ...Array.from(new Set(productCategories)).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = normalizeText(product.name).includes(normalizeText(productSearch));

      const matchesCategory =
        selectedCategory === "Todas" || product.categoryName === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, selectedCategory]);

  const filteredPurchaseProducts = useMemo(() => {
    const search = normalizeText(purchaseProductSearch);

    if (!search) {
      return products.slice(0, 12);
    }

    return products
      .filter((product) => {
        const name = normalizeText(product.name);
        const category = normalizeText(product.categoryName ?? "");
        const brand = normalizeText(product.brand ?? "");

        return name.includes(search) || category.includes(search) || brand.includes(search);
      })
      .slice(0, 12);
  }, [products, purchaseProductSearch]);

  const filteredPantryItems = useMemo(() => {
    if (pantryFilter === "expiring") {
      return pantryItems.filter((item) => item.status === "VENCE_EM_BREVE");
    }

    if (pantryFilter === "expired") {
      return pantryItems.filter((item) => item.status === "VENCIDO");
    }

    return pantryItems.filter((item) => item.status !== "VENCIDO");
  }, [pantryItems, pantryFilter]);

  const checkedItemsCount = shoppingList.filter((item) => item.checked).length;

  function normalizeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

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

  function getPantryFilterTitle() {
    if (pantryFilter === "expiring") {
      return "Vencendo em breve";
    }

    if (pantryFilter === "expired") {
      return "Produtos vencidos";
    }

    return "Itens disponíveis";
  }

  function openPantryWithFilter(filter: PantryFilter) {
    setPantryFilter(filter);
    setPantryMessage("");
    setActiveTab("pantry");
  }

  function selectPurchaseProduct(product: ProductResponse) {
    setSelectedProductId(String(product.id));
    setPurchaseProductSearch(product.name);
    setShowPurchaseProductOptions(false);
  }

  async function refreshData() {
    const [
      dashboardResponse,
      expiringResponse,
      pantryResponse,
      purchasesResponse,
    ] = await Promise.all([
      api.get<DashboardResponse>("/dashboard/monthly-summary"),
      api.get<PantryItemResponse[]>("/pantry/expiring?days=7"),
      api.get<PantryItemResponse[]>("/pantry"),
      api.get<PurchaseResponse[]>("/purchases"),
    ]);

    setDashboard(dashboardResponse.data);
    setExpiringItems(expiringResponse.data);
    setPantryItems(pantryResponse.data);
    setPurchases(purchasesResponse.data);
  }

  async function removePantryItem(itemId: number) {
    const confirmed = window.confirm("Remover este item da despensa?");

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/pantry/${itemId}`);
      setPantryMessage("Item removido da despensa.");
      await refreshData();
    } catch (error) {
      console.error("Erro ao remover item da despensa", error);
      setPantryMessage("Não foi possível remover o item.");
    }
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
      setPantryFilter("all");
    } catch (error) {
      console.error("Erro ao registrar compra", error);
      setFormMessage("Não foi possível registrar a compra.");
    } finally {
      setSavingPurchase(false);
    }
  }

  function addProductToShoppingList(product: ProductResponse) {
    setShoppingList((currentList) => {
      const existingItem = currentList.find((item) => item.productId === product.id);

      if (existingItem) {
        return currentList.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                checked: false,
              }
            : item
        );
      }

      return [
        ...currentList,
        {
          productId: product.id,
          productName: product.name,
          categoryName: product.categoryName,
          quantity: 1,
          checked: false,
        },
      ];
    });
  }

  function removeProductFromShoppingList(productId: number) {
    setShoppingList((currentList) =>
      currentList.filter((item) => item.productId !== productId)
    );
  }

  function increaseShoppingListQuantity(productId: number) {
    setShoppingList((currentList) =>
      currentList.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseShoppingListQuantity(productId: number) {
    setShoppingList((currentList) =>
      currentList
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleChecklistItem(productId: number) {
    setShoppingList((currentList) =>
      currentList.map((item) =>
        item.productId === productId
          ? {
              ...item,
              checked: !item.checked,
            }
          : item
      )
    );
  }

  function clearCheckedItems() {
    setShoppingList((currentList) => currentList.filter((item) => !item.checked));
  }

  function clearShoppingList() {
    setShoppingList([]);
    setActiveTab("list");
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
            <button
              className="spent-card clickable-card"
              onClick={() => setActiveTab("extract")}
            >
              <div>
                <p>Gastos do mês</p>
                <strong>{formatCurrency(dashboard?.monthlySpent)}</strong>
                <span>{dashboard?.purchasesInMonth ?? 0} compras registradas</span>
              </div>
              <ChevronRight size={24} />
            </button>

            <section className="summary-grid">
              <button
                className="summary-card clickable-card"
                onClick={() => openPantryWithFilter("all")}
              >
                <Home size={22} />
                <strong>{dashboard?.pantryItemsCount ?? 0}</strong>
                <span>itens na despensa</span>
              </button>

              <button
                className="summary-card warning clickable-card"
                onClick={() => openPantryWithFilter("expiring")}
              >
                <CalendarClock size={22} />
                <strong>{dashboard?.expiringSoonCount ?? 0}</strong>
                <span>vencendo em breve</span>
              </button>

              <button
                className="summary-card danger clickable-card"
                onClick={() => openPantryWithFilter("expired")}
              >
                <AlertTriangle size={22} />
                <strong>{dashboard?.expiredItemsCount ?? 0}</strong>
                <span>vencidos</span>
              </button>
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
              <p>Despensa</p>
              <h2>{getPantryFilterTitle()}</h2>
            </section>

            <section className="filter-tabs">
              <button
                className={pantryFilter === "all" ? "active" : ""}
                onClick={() => setPantryFilter("all")}
              >
                Todos
              </button>

              <button
                className={pantryFilter === "expiring" ? "active" : ""}
                onClick={() => setPantryFilter("expiring")}
              >
                Vencendo
              </button>

              <button
                className={pantryFilter === "expired" ? "active" : ""}
                onClick={() => setPantryFilter("expired")}
              >
                Vencidos
              </button>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Despensa digital</p>
                  <h2>{filteredPantryItems.length} itens encontrados</h2>
                </div>
                <PackageSearch size={22} />
              </div>

              {pantryMessage && <p className="form-message">{pantryMessage}</p>}

              {filteredPantryItems.length === 0 ? (
                <p className="empty">Nenhum item encontrado nesse filtro.</p>
              ) : (
                <div className="list">
                  {filteredPantryItems.map((item) => (
                    <article key={item.id} className="pantry-list-item">
                      <div>
                        <strong>{item.productName}</strong>
                        <span>
                          {item.categoryName ?? "Sem categoria"} • {item.quantity} un. •{" "}
                          {formatDate(item.expirationDate)}
                        </span>
                      </div>

                      <div className="pantry-actions">
                        <span className={`badge status-${item.status.toLowerCase()}`}>
                          {getStatusLabel(item.status)}
                        </span>

                        <button
                          className="icon-button"
                          onClick={() => removePantryItem(item.id)}
                          aria-label="Remover item da despensa"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === "extract" && (
          <>
            <section className="screen-header with-back">
              <button className="back-button" onClick={() => setActiveTab("home")}>
                <ChevronLeft size={20} />
              </button>

              <div>
                <p>Extrato</p>
                <h2>Histórico de compras</h2>
              </div>
            </section>

            <section className="spent-card extract-total-card">
              <div>
                <p>Total do mês</p>
                <strong>{formatCurrency(dashboard?.monthlySpent)}</strong>
                <span>{dashboard?.purchasesInMonth ?? 0} compras registradas</span>
              </div>
              <ReceiptText size={24} />
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Compras</p>
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
              <p>Lista de mercado</p>
              <h2>Monte sua compra antes de sair</h2>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Produtos</p>
                  <h2>Adicionar à lista</h2>
                </div>
                <ShoppingCart size={22} />
              </div>

              <div className="search-box">
                <Search size={18} />
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar produto"
                />
              </div>

              <div className="category-scroll">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={selectedCategory === category ? "category-chip active" : "category-chip"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="product-catalog">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="catalog-item">
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.categoryName ?? "Sem categoria"}</span>
                    </div>

                    <button
                      className="small-add-button"
                      onClick={() => addProductToShoppingList(product)}
                    >
                      <Plus size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Sua lista</p>
                  <h2>{shoppingList.length} produtos adicionados</h2>
                </div>
                <ClipboardCheck size={22} />
              </div>

              {shoppingList.length === 0 ? (
                <p className="empty">Adicione produtos para montar sua lista de mercado.</p>
              ) : (
                <>
                  <div className="list">
                    {shoppingList.map((item) => (
                      <article key={item.productId} className="shopping-list-item">
                        <div>
                          <strong>{item.productName}</strong>
                          <span>{item.categoryName ?? "Sem categoria"}</span>
                        </div>

                        <div className="quantity-control">
                          <button onClick={() => decreaseShoppingListQuantity(item.productId)}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => increaseShoppingListQuantity(item.productId)}>
                            +
                          </button>
                        </div>

                        <button
                          className="icon-button"
                          onClick={() => removeProductFromShoppingList(item.productId)}
                          aria-label="Remover produto"
                        >
                          <Trash2 size={17} />
                        </button>
                      </article>
                    ))}
                  </div>

                  <button
                    className="submit-action"
                    onClick={() => setActiveTab("checklist")}
                  >
                    Abrir checklist no mercado
                  </button>
                </>
              )}
            </section>
          </>
        )}

        {activeTab === "checklist" && (
          <>
            <section className="screen-header">
              <p>Checklist de compra</p>
              <h2>Marque o que já pegou</h2>
            </section>

            <section className="content-card">
              <div className="section-title">
                <div>
                  <p>Progresso</p>
                  <h2>
                    {checkedItemsCount} de {shoppingList.length} itens marcados
                  </h2>
                </div>
                <CheckCircle2 size={22} />
              </div>

              {shoppingList.length === 0 ? (
                <p className="empty">Sua lista está vazia.</p>
              ) : (
                <div className="checklist">
                  {shoppingList.map((item) => (
                    <label
                      key={item.productId}
                      className={item.checked ? "checklist-item checked" : "checklist-item"}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklistItem(item.productId)}
                      />
                      <div>
                        <strong>{item.productName}</strong>
                        <span>
                          {item.quantity} un. • {item.categoryName ?? "Sem categoria"}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="checklist-actions">
                <button className="secondary-action" onClick={() => setActiveTab("list")}>
                  Voltar para lista
                </button>

                <button className="primary-action" onClick={clearCheckedItems}>
                  Remover marcados
                </button>

                <button className="danger-action" onClick={clearShoppingList}>
                  Limpar lista
                </button>
              </div>
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
                    <option value="" disabled>
                      Selecione um mercado
                    </option>

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
                <label className="autocomplete-label">
                  Produto
                  <div className="autocomplete" ref={autocompleteRef}>
                    <input
                      type="text"
                      value={purchaseProductSearch}
                      onFocus={() => setShowPurchaseProductOptions(true)}
                      onChange={(event) => {
                        setPurchaseProductSearch(event.target.value);
                        setSelectedProductId("");
                        setShowPurchaseProductOptions(true);
                      }}
                      placeholder="Digite para buscar. Ex: leite, manteiga, arroz"
                    />

                    {showPurchaseProductOptions && (
                      <div className="autocomplete-options">
                        {filteredPurchaseProducts.length === 0 ? (
                          <p className="autocomplete-empty">Nenhum produto encontrado.</p>
                        ) : (
                          filteredPurchaseProducts.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              className="autocomplete-option"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                selectPurchaseProduct(product);
                              }}
                            >
                              <strong>{product.name}</strong>
                              <span>
                                {product.categoryName ?? "Sem categoria"}
                                {product.brand ? ` • ${product.brand}` : ""}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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
            className={activeTab === "home" || activeTab === "extract" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Início
          </button>

          <button
            className={activeTab === "pantry" ? "active" : ""}
            onClick={() => {
              setPantryFilter("all");
              setPantryMessage("");
              setActiveTab("pantry");
            }}
          >
            Despensa
          </button>

          <button
            className={activeTab === "list" || activeTab === "checklist" ? "active" : ""}
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