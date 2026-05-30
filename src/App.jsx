import {useState, useEffect, useRef, useCallback, useMemo, memo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {createSelector} from "@reduxjs/toolkit";
import ingredientsData from "./data/IngredientsData";
import {loadUserFromStorage} from "./store/slices/userSlice";
import {addOrder} from "./store/slices/ordersSlice";
import BunSelector from "./components/BunSelector";
import {
  openModal,
  closeModal,
  setPendingOrder,
  showNotification,
  hideNotification,
  setLoading,
} from "./store/slices/uiSlice";
import {
  setBun,
  addFilling,
  removeFilling as removeFillingAction,
  moveFilling,
  clearBurger,
} from "./store/slices/burgerSlice";
import ConstructorRow from "./components/ConstructorRow";
import IngredientCard from "./components/IngredientCard";
import Navigation from "./components/Navigation";
import PriceIcon from "./components/icons/PriceIcon";
import ModalContent from "./components/ModalContent";
import Modal from "./components/Modal";
import IngredientModalContent from "./components/IngredientModalContent";
import OrderModal from "./components/OrderModal";
import SuccessModal from "./components/SuccessModal";
import OrderFeed from "./components/OrderFeed";
import ProfilePage from "./components/ProfilePage";
import SortableConstructorRow from "./components/SortableConstructorRow";
import EmptyConstructor from "./components/EmptyConstructor";
import {useTheme} from "./hooks/useTheme";
import "./App.css";

// Оптимизированные селекторы с memoization
const selectBun = (state) => state.burger.bun;
const selectSelectedFillings = (state) => state.burger.selectedFillings;
const selectModals = (state) => state.ui.modals;
const selectSelectedIngredient = (state) => state.ui.selectedIngredient;
const selectPendingOrder = (state) => state.ui.pendingOrder;
const selectNotification = (state) => state.ui.notification;
const selectIsLoading = (state) => state.ui.isLoading;
const selectAllOrders = (state) => state.orders.allOrders;

const selectTotalPrice = createSelector([selectBun, selectSelectedFillings], (bun, selectedFillings) => {
  const bunPrice = bun ? bun.price * 2 : 0;
  const fillingsPrice = selectedFillings.reduce((sum, ing) => sum + ing.price, 0);
  return bunPrice + fillingsPrice;
});

const selectTotalIngredientsCount = createSelector(
  [selectBun, selectSelectedFillings],
  (bun, selectedFillings) => (bun ? 2 : 0) + selectedFillings.length
);

const selectFillingIds = createSelector(
  [selectSelectedFillings],
  (selectedFillings) => selectedFillings.map((item) => item.uniqueId),
  {
    memoizeOptions: {
      resultEqualityCheck: (a, b) => {
        if (!a || !b || a.length !== b.length) return false;
        return a.every((id, index) => id === b[index]);
      },
    },
  }
);

const selectIngredientCountsHash = createSelector([selectBun, selectSelectedFillings], (bun, selectedFillings) => {
  const counts = {};
  if (bun) counts[bun.id] = 2;
  selectedFillings.forEach((f) => {
    counts[f.id] = (counts[f.id] || 0) + 1;
  });
  return JSON.stringify(counts);
});

const useIngredientCounts = () => {
  const countsHash = useSelector(selectIngredientCountsHash);
  return useMemo(() => JSON.parse(countsHash), [countsHash]);
};

// Мемоизированный компонент секции ингредиентов
const IngredientsSection = memo(
  ({
    categories,
    categoryNames,
    activeTab,
    onTabChange,
    scrollContainerRef,
    animatingIngredient,
    onAddIngredient,
    ingredientCounts,
    onCardClick,
  }) => {
    const handleAddIngredient = useCallback(
      (ingredient) => {
        onAddIngredient(ingredient);
      },
      [onAddIngredient]
    );

    return (
      <>
        <h1 className="main-title animate-fade-in">Соберите бургер</h1>
        <div className="tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`tab ${activeTab === category ? "active-tab" : ""}`}
              onClick={() => onTabChange(category)}
            >
              {categoryNames[category] || category}
            </button>
          ))}
        </div>
        <div className="ingredients-scroll" ref={scrollContainerRef}>
          {categories.map((category) => (
            <div key={category}>
              <h2 id={category} className="category-title">
                {categoryNames[category] || category}
              </h2>
              <div className="ingredients-grid">
                {ingredientsData[category].map((item) => (
                  <div
                    key={item.id}
                    className={`ingredient-card-wrapper ${animatingIngredient === item.id ? "animate-pulse" : ""}`}
                  >
                    <IngredientCard
                      item={item}
                      onAdd={handleAddIngredient}
                      count={ingredientCounts[item.id] || 0}
                      onCardClick={onCardClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
);

// Компонент списка начинок с сортировкой
const FillingsList = memo(({fillings, onRemoveFilling, fillingIds}) => {
  if (fillings.length === 0) {
    return (
      <div className="empty-fillings-mobile">
        <p>Добавь соус или начинку</p>
      </div>
    );
  }

  return (
    <SortableContext items={fillingIds} strategy={verticalListSortingStrategy}>
      {fillings.map((item) => (
        <div key={item.uniqueId} className="filling-item fade-in">
          <SortableConstructorRow id={item.uniqueId} item={item} onRemove={onRemoveFilling} />
        </div>
      ))}
    </SortableContext>
  );
});

// Мемоизированный компонент конструктора
const BurgerConstructor = memo(
  ({
    bun,
    selectedFillings,
    fillingIds,
    totalPrice,
    onRemoveFilling,
    onOrderClick,
    isMobile,
    onOpenBunSelector,
    onQuickAddBun,
    hasFillings,
  }) => {
    if (!bun) {
      return (
        <div className="constructor-section">
          <EmptyConstructor
            hasBun={false}
            hasFillings={false}
            onQuickAddBun={onQuickAddBun}
            onOpenBunSelector={onOpenBunSelector}
            isMobile={isMobile}
          />
        </div>
      );
    }

    return (
      <div className="constructor-section">
        <div className="constructor-list">
          {bun && (
            <div className="animate-slide-in">
              <ConstructorRow item={bun} type="top" isLocked={true} onRemove={() => {}} />
            </div>
          )}

          <div className="fillings-scroll">
            <FillingsList fillings={selectedFillings} onRemoveFilling={onRemoveFilling} fillingIds={fillingIds} />
          </div>

          {bun && (
            <div className="animate-slide-in">
              <ConstructorRow item={bun} type="bottom" isLocked={true} onRemove={() => {}} />
            </div>
          )}
        </div>

        <div className="order-info">
          <div className="total-price">
            <span className="price-digit">{totalPrice}</span>
            <PriceIcon />
          </div>
          <button
            className={`order-btn ${!hasFillings ? "btn-pulse" : ""}`}
            onClick={onOrderClick}
            disabled={!hasFillings}
          >
            Оформить заказ
          </button>
        </div>
      </div>
    );
  }
);

const App = () => {
  const dispatch = useDispatch();
  const {setTheme} = useTheme();

  // Флаг монтирования компонента
  const isMountedRef = useRef(true);

  // Точечные селекторы
  const bun = useSelector(selectBun);
  const selectedFillings = useSelector(selectSelectedFillings);
  const modals = useSelector(selectModals);
  const selectedIngredient = useSelector(selectSelectedIngredient);
  const pendingOrder = useSelector(selectPendingOrder);
  const notification = useSelector(selectNotification);
  const isLoading = useSelector(selectIsLoading);
  const allOrders = useSelector(selectAllOrders);

  // Мемоизированные значения
  const totalPrice = useSelector(selectTotalPrice);
  const totalIngredientsCount = useSelector(selectTotalIngredientsCount);
  const fillingIds = useSelector(selectFillingIds);
  const ingredientCounts = useIngredientCounts();

  // Состояния
  const [activeMainTab, setActiveMainTab] = useState("constructor");
  const [activeTab, setActiveTab] = useState("buns");
  const [animatingIngredient, setAnimatingIngredient] = useState(null);
  const [showBunSelector, setShowBunSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 350);

  const scrollContainerRef = useRef(null);
  const nextOrderIdRef = useRef(1000);
  const notificationTimeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  // Принудительная установка космической темы при загрузке
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      setTheme("space");
    }
  }, [setTheme]);

  // Хук для монтирования
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Хук для адаптивности
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 350);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Очистка таймаута анимации
  useEffect(() => {
    if (animatingIngredient) {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      animationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setAnimatingIngredient(null);
        }
        animationTimeoutRef.current = null;
      }, 300);

      return () => {
        if (animationTimeoutRef.current) {
          clearTimeout(animationTimeoutRef.current);
          animationTimeoutRef.current = null;
        }
      };
    }
  }, [animatingIngredient]);

  // Настройка сенсоров для DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
    useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
  );

  // Мемоизированные данные
  const categories = useMemo(
    () => Object.keys(ingredientsData).filter((key) => Array.isArray(ingredientsData[key])),
    []
  );

  const categoryNames = useMemo(
    () => ({
      buns: "Булки",
      sauces: "Соусы",
      mains: "Начинки",
    }),
    []
  );

  // Функция для закрытия модальных окон
  const closeModalHandler = useCallback(
    (modalName) => {
      if (!isMountedRef.current) return;
      dispatch(closeModal({modal: modalName}));
    },
    [dispatch]
  );

  const showNotificationWithAutoHide = useCallback(
    (message, type) => {
      if (!isMountedRef.current) return;
      dispatch(showNotification({message, type}));
    },
    [dispatch]
  );

  const addIngredient = useCallback(
    (ingredient) => {
      if (!isMountedRef.current) return;
      setAnimatingIngredient(ingredient.id);

      if (ingredient.type === "bun") {
        dispatch(setBun(ingredient));
        showNotificationWithAutoHide(` ${ingredient.name} добавлена!`, "success");
      } else {
        dispatch(addFilling(ingredient));
        showNotificationWithAutoHide(` ${ingredient.name} добавлен!`, "success");
      }
    },
    [dispatch, showNotificationWithAutoHide]
  );

  const handleRemoveFilling = useCallback(
    (uniqueId) => {
      const ingredient = selectedFillings.find((item) => item.uniqueId === uniqueId);
      if (ingredient && isMountedRef.current) {
        dispatch(removeFillingAction(uniqueId));
        showNotificationWithAutoHide(`🗑️ ${ingredient.name} удален`, "info");
      }
    },
    [dispatch, selectedFillings, showNotificationWithAutoHide]
  );

  const handleDragEnd = useCallback(
    (event) => {
      const {active, over} = event;
      if (active.id !== over?.id && isMountedRef.current) {
        const oldIndex = selectedFillings.findIndex((item) => item.uniqueId === active.id);
        const newIndex = selectedFillings.findIndex((item) => item.uniqueId === over?.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          dispatch(moveFilling({fromIndex: oldIndex, toIndex: newIndex}));
        }
      }
    },
    [dispatch, selectedFillings]
  );

  // Модальные окна
  const openIngredientModal = useCallback(
    (ingredient) => {
      if (!isMountedRef.current) return;
      dispatch(openModal({modal: "ingredientModal", ingredient}));
    },
    [dispatch]
  );

  const openOrderModal = useCallback(() => {
    if (!isMountedRef.current) return;
    if (!bun) {
      showNotificationWithAutoHide("Сначала добавьте булку!", "error");
      return;
    }
    if (selectedFillings.length === 0) {
      showNotificationWithAutoHide("Добавьте хотя бы одну начинку!", "error");
      return;
    }
    dispatch(openModal({modal: "orderModal"}));
  }, [dispatch, bun, selectedFillings.length, showNotificationWithAutoHide]);

  const generateOrderNumber = useCallback(() => nextOrderIdRef.current++, []);

  const handleOrderSuccess = useCallback(async () => {
    if (!bun) {
      showNotificationWithAutoHide("Добавьте булку!", "error");
      closeModalHandler("orderModal");
      return;
    }

    const orderNumber = generateOrderNumber();
    const bunName = bun.name.split(" ")[0];
    const burgerName = `${bunName} бургер с ${selectedFillings.length} ингредиентами`;
    const allIngredients = [bun, ...selectedFillings, bun];

    dispatch(setLoading(true));

    try {
      await dispatch(
        addOrder({
          orderNumber,
          burgerName,
          totalPrice,
          allIngredients,
        })
      ).unwrap();

      if (!isMountedRef.current) return;

      dispatch(
        setPendingOrder({
          orderNumber,
          totalPrice,
          ingredientsCount: totalIngredientsCount,
        })
      );

      closeModalHandler("orderModal");
      dispatch(openModal({modal: "successModal"}));
      dispatch(clearBurger());
      showNotificationWithAutoHide("Заказ успешно оформлен!", "success");
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error("Ошибка оформления заказа:", error);
      showNotificationWithAutoHide("Ошибка оформления заказа", "error");
    } finally {
      if (isMountedRef.current) {
        dispatch(setLoading(false));
      }
    }
  }, [
    bun,
    selectedFillings,
    totalPrice,
    totalIngredientsCount,
    dispatch,
    generateOrderNumber,
    showNotificationWithAutoHide,
    closeModalHandler,
  ]);

  // Управление уведомлениями
  useEffect(() => {
    if (notification) {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      notificationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          dispatch(hideNotification());
        }
        notificationTimeoutRef.current = null;
      }, 3000);

      return () => {
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
          notificationTimeoutRef.current = null;
        }
      };
    }
  }, [notification, dispatch]);

  // Скролл с throttling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = container.scrollTop + 100;
          const activeCategory =
            categories.find((category) => {
              const element = document.getElementById(category);
              if (element) {
                const {offsetTop, offsetHeight} = element;
                return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
              }
              return false;
            }) || categories[0];

          if (activeCategory !== activeTab && isMountedRef.current) {
            setActiveTab(activeCategory);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener("scroll", handleScroll, {passive: true});
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [categories, activeTab]);

  const scrollToCategory = useCallback((category) => {
    const element = document.getElementById(category);
    const container = scrollContainerRef.current;
    if (element && container && isMountedRef.current) {
      container.scrollTo({top: element.offsetTop - 20, behavior: "smooth"});
    }
  }, []);

  const handleTabChange = useCallback(
    (tab) => {
      if (!isMountedRef.current) return;
      setActiveTab(tab);
      scrollToCategory(tab);
    },
    [scrollToCategory]
  );

  // Загрузка сессии
  useEffect(() => {
    if (isMountedRef.current) {
      dispatch(loadUserFromStorage());
    }
  }, [dispatch]);

  const handleSelectBun = useCallback(
    (bun) => {
      if (!isMountedRef.current) return;
      addIngredient(bun);
      setShowBunSelector(false);
    },
    [addIngredient]
  );

  const handleQuickAddBun = useCallback(() => {
    if (!isMountedRef.current) return;
    const defaultBun = ingredientsData.buns[0];
    if (defaultBun) addIngredient(defaultBun);
  }, [addIngredient]);

  const hasFillings = selectedFillings.length > 0;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="app-container">
        <Navigation onTabChange={setActiveMainTab} activeMainTab={activeMainTab} />

        {/* Модальные окна */}
        <Modal isOpen={modals.ingredientModal} onClose={() => closeModalHandler("ingredientModal")}>
          {selectedIngredient ? (
            <IngredientModalContent
              ingredient={selectedIngredient}
              onClose={() => closeModalHandler("ingredientModal")}
              onAdd={addIngredient}
            />
          ) : (
            <ModalContent />
          )}
        </Modal>

        <OrderModal
          isOpen={modals.orderModal}
          onClose={() => closeModalHandler("orderModal")}
          totalPrice={totalPrice}
          ingredientsCount={totalIngredientsCount}
          onSubmit={handleOrderSuccess}
          isLoading={isLoading}
        />

        <SuccessModal
          isOpen={modals.successModal}
          onClose={() => closeModalHandler("successModal")}
          orderNumber={pendingOrder?.orderNumber}
          totalPrice={pendingOrder?.totalPrice}
          ingredientsCount={pendingOrder?.ingredientsCount}
        />

        {/* BunSelector только для десктопа */}
        {!isMobile && showBunSelector && (
          <BunSelector onSelectBun={handleSelectBun} onClose={() => setShowBunSelector(false)} currentBun={bun} />
        )}

        {activeMainTab === "constructor" && (
          <main className="main-layout">
            <div className="ingredients-section">
              <IngredientsSection
                categories={categories}
                categoryNames={categoryNames}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                scrollContainerRef={scrollContainerRef}
                animatingIngredient={animatingIngredient}
                onAddIngredient={addIngredient}
                ingredientCounts={ingredientCounts}
                onCardClick={openIngredientModal}
              />
            </div>

            <BurgerConstructor
              bun={bun}
              selectedFillings={selectedFillings}
              fillingIds={fillingIds}
              totalPrice={totalPrice}
              onRemoveFilling={handleRemoveFilling}
              onOrderClick={openOrderModal}
              isMobile={isMobile}
              onOpenBunSelector={() => setShowBunSelector(true)}
              onQuickAddBun={handleQuickAddBun}
              hasFillings={hasFillings}
            />
          </main>
        )}

        {activeMainTab === "orders" && <OrderFeed orders={allOrders} />}
        {activeMainTab === "profile" && <ProfilePage />}
      </div>
    </DndContext>
  );
};

export default App;
