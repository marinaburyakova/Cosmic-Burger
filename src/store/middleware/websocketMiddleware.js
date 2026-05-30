import { webSocketService } from '../../services/websocket';
import { 
  wsConnected, 
  wsDisconnected, 
  wsError,
  newOrderReceived,
  updateOrderStatus
} from '../slices/ordersSlice';

let initialized = false;

export const websocketMiddleware = (store) => (next) => (action) => {
  if (action.type === 'app/init' && !initialized) {
    initialized = true;
    
    // Запускаем имитацию WebSocket
    webSocketService.connect();
    
    webSocketService.on('connected', () => {
      store.dispatch(wsConnected());
    });
    
    webSocketService.on('disconnected', () => {
      store.dispatch(wsDisconnected());
    });
    
    webSocketService.on('error', (error) => {
      console.warn('WebSocket error (using mock mode):', error);
      // Не показываем ошибку пользователю в мок режиме
    });
    
    webSocketService.on('new_order', (order) => {
      store.dispatch(newOrderReceived(order));
    });
    
    webSocketService.on('order_update', (order) => {
      store.dispatch(updateOrderStatus({ id: order.id, status: order.status }));
    });
    
    webSocketService.on('order_status', (order) => {
      store.dispatch(updateOrderStatus({ id: order.id, status: order.status }));
    });
  }
  
  return next(action);
};