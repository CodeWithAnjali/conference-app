import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type ConnectionStatus = "connected" | "disconnected";

export function useSocketIO(name: string) {
    const connection = io(name);
  
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  
    useEffect(() => {
      if (!connection) return;
  
      connection.on('connect', () => {
        setConnectionStatus("connected");
      })
  
      connection.on("disconnect", () => {
        setConnectionStatus("disconnected");
      });
  
      return () => {
        connection.off("connect");
        connection.off("disconnect");
      }
    }, [connection]);
  
    return { connection, connectionStatus }
  }