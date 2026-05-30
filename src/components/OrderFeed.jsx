import {useState} from "react";
import {useSelector} from "react-redux";
import PriceIcon from "./icons/PriceIcon";
import style from "./OrderFeed.module.css";

const OrderFeed = ({orders}) => {
  const {wsConnected, stats} = useSelector((state) => state.orders);
  const [filter, setFilter] = useState("all"); // all, pending, preparing, ready

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Ожидает";
      case "preparing":
        return "🍔 Готовится";
      case "ready":
        return "✅ Готов к выдаче";
      case "completed":
        return "📦 Выдан";
      default:
        return "📝 В обработке";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
         return style["status-pending"];
      case "preparing":
         return style["status-preparing"];
      case "ready":
        return style["status-ready"];
      case "completed":
       return style["status-completed"];
      default:
        return "";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  return (
    <div className={style["order-feed-container"]}>
      <div className={style["feed-header"]}>
        <h1 className={style["feed-title"]}>Лента заказов</h1>
        <div className={style["ws-status"]}>
          <span className={`${style["ws-indicator"]} ${wsConnected ? style.connected : style.disconnected}`}></span>

          <span>{wsConnected ? "В реальном времени" : "Офлайн режим"}</span>
        </div>
      </div>

      {/* Статистика */}
      <div className={style["stats-cards"]}>
        <div className={style["stat-card"]}>
          <span className={style["stat-value"]}>{stats.total}</span>
          <span className={style["stat-label"]}>Всего заказов</span>
        </div>
        <div className={style["stat-card"]}>
          <span className={style["stat-value"]}>{stats.preparing}</span>
          <span className={style["stat-label"]}>Готовится</span>
        </div>
        <div className={style["stat-card"]}>
          <span className={style["stat-value"]}>{stats.ready}</span>
          <span className={style["stat-label"]}>Готовы</span>
        </div>
      </div>

      {/* Фильтры */}
      <div className={style["feed-filters"]}>
<button 
  className={`${style['filter-btn']} ${filter === "all" ? style.active : ""}`} 
  onClick={() => setFilter("all")}
>
  Все
</button>

        <button className={`${style['filter-btn']} ${filter === "pending" ? style.active: ""}`} onClick={() => setFilter("pending")}>
          Ожидают
        </button>
        <button
          className={`${style['filter-btn']} ${filter === "preparing" ? style.active : ""}`}
          onClick={() => setFilter("preparing")}
        >
          Готовятся
        </button>
        <button className={`${style['filter-btn']} ${filter === "ready" ? style.active : ""}`} onClick={() => setFilter("ready")}>
          Готовы
        </button>
      </div>

      <div className={style["order-feed-layout"]}>
        <div className={style["orders-list"]}>
          {filteredOrders.length === 0 ? (
            <div className={style["empty-orders"]}>
              <p className={style["empty-orders-p"]}>Нет заказов</p>
              <small className={style["empty-orders-small"]}>Оформите первый заказ!</small>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={`${style['order-card']} ${getStatusClass(order.status)}`}>
                <div className={style["order-header"]}>
                  <span className={style["order-id"]}>#{order.id}</span>
                  <span className={`${style['order-status']} ${getStatusClass(order.status)}`}>{getStatusText(order.status)}</span>
                </div>
                <div className={style["order-info"]}>
                  <h3 className={style["order-name"]}>{order.name}</h3>
                </div>
                <div className={style["order-footer"]}>
                  <div className={style["order-ingredients-preview"]}>
                    {order.ingredients?.slice(0, 3).map((ing, idx) => (
                      <div key={idx} className={style["preview-icon"]}>
                        <img className={style["preview-icon-img"]} src={ing.image} alt={ing.name} />
                      </div>
                    ))}
                    {order.ingredients?.length > 3 && (
                      <div className={style["preview-more"]}>+{order.ingredients.length - 3}</div>
                    )}
                  </div>
                  <div className={style["order-price"]}>
                    <span>{order.totalPrice}</span>
                    <PriceIcon />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderFeed;
