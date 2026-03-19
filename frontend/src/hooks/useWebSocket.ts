import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url: string, token?: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = token ? `${url}?token=${token}` : url;
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
    };
  }, [url, token]);

  const sendMessage = (message: string) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(message);
    }
  };

  return { messages, sendMessage };
};

export default useWebSocket;
