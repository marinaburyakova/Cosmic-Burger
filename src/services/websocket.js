class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isMockMode = true; // Используем имитацию вместо реального WebSocket
    this.mockInterval = null;
    this.mockOrders = [
      { id: 12345, status: 'preparing', statusText: 'Готовится' },
      { id: 12346, status: 'pending', statusText: 'Ожидает' },
    ];
  }

  connect() {
    if (this.isMockMode) {
      console.log('Mock WebSocket mode activated');
      this.emit('connected', { message: 'Mock WebSocket connected' });
      
      // Имитируем получение заказов каждые 10 секунд
      this.mockInterval = setInterval(() => {
        this.simulateNewOrder();
      }, 10000);
      
      return;
    }
    
    // Реальный WebSocket (закомментирован, так как сервер ненадежен)
    try {
      this.socket = new WebSocket('wss://echo.websocket.org');
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected', { message: 'Connected to order feed' });
        
        this.send({
          type: 'subscribe',
          channel: 'orders'
        });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected', {});
        this.reconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.emit('error', error);
    }
  }
  
  // Имитация получения нового заказа
  simulateNewOrder() {
    const randomOrder = {
      type: 'new_order',
      order: {
        id: Math.floor(Math.random() * 9000) + 1000,
        name: `Космический бургер #${Math.floor(Math.random() * 100)}`,
        totalPrice: Math.floor(Math.random() * 500) + 200,
        status: 'pending',
        statusText: 'Ожидает подтверждения',
        timestamp: Date.now(),
        ingredients: [],
      }
    };
    
    this.emit('new_order', randomOrder.order);
    console.log('Mock: New order received', randomOrder.order.id);
    
    // Через 5 секунд меняем статус заказа
    setTimeout(() => {
      const statusUpdate = {
        type: 'order_update',
        order: {
          id: randomOrder.order.id,
          status: 'preparing',
          statusText: 'Готовится',
        }
      };
      this.emit('order_update', statusUpdate.order);
      console.log('Mock: Order status updated', randomOrder.order.id, '→ готовится');
      
      // Еще через 5 секунд заказ готов
      setTimeout(() => {
        const readyUpdate = {
          type: 'order_update',
          order: {
            id: randomOrder.order.id,
            status: 'ready',
            statusText: 'Готов к выдаче',
          }
        };
        this.emit('order_update', readyUpdate.order);
        console.log('Mock: Order status updated', randomOrder.order.id, '→ готов');
      }, 5000);
    }, 5000);
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isMockMode) {
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts + 1}`);
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay);
    } else if (this.isMockMode) {
      console.log('Mock mode: no reconnection needed');
    }
  }
  
  handleMessage(data) {
    switch (data.type) {
      case 'new_order':
        this.emit('new_order', data.order);
        break;
      case 'order_update':
        this.emit('order_update', data.order);
        break;
      case 'order_status':
        this.emit('order_status', data.order);
        break;
      default:
        this.emit('message', data);
    }
  }
  
  send(data) {
    if (!this.isMockMode && this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else if (this.isMockMode) {
      console.log('Mock: Sending data', data);
    }
  }
  
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }
  
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }
  
  disconnect() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const webSocketService = new WebSocketService();