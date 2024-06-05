import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";



/**
 * 
 * @param {string} name 
 * @returns {{ connection: Socket, connectionStatus: import("../types").ConnectionStatus}}
 */
export function useSocketIO(name) {
    const connection = io(name);
  
    /**
     * @type {[import("../types").ConnectionStatus]}
     */
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
  
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