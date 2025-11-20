type WsSocket = any;

export class WebsocketManager {
  private map = new Map<string, Set<WsSocket>>();

  attach(socket: WsSocket, orderId: string) {
    if (!this.map.has(orderId)) this.map.set(orderId, new Set());
    this.map.get(orderId)!.add(socket);
    const onClose = () => {
      const s = this.map.get(orderId);
      if (s) {
        s.delete(socket);
        if (s.size === 0) this.map.delete(orderId);
      }
    };
    try {
      socket.on('close', onClose);
    } catch (err) {
      // not all socket fakes implement on
    }
  }

  emit(orderId: string, payload: any) {
    const clients = this.map.get(orderId);
    if (!clients) return;
    for (const s of clients) {
      try {
        s.send(JSON.stringify(payload));
      } catch (err) {
        // ignore broken sockets
      }
    }
  }
}
