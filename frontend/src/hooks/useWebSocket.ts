import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url: string, token?: string, section?: string, regNumber?: string) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    const queryParams = new URLSearchParams();
    if (token) queryParams.append("token", token);
    if (section) queryParams.append("section", section);
    if (regNumber) queryParams.append("reg", regNumber);
    const queryString = queryParams.toString();
    const wsUrl = queryString ? `${url}?${queryString}` : url;

    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    return () => {
      if (webSocketRef.current) {
        webSocketRef.current.close();
      }
      setIsConnected(false);
    };
  }, [url, token, section, regNumber]);

  const sendMessage = (message: string) => {
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(message);
    }
  };

  return { messages, sendMessage, isConnected };
};

export default useWebSocket;
