import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

/**
 * @type {import("../types").SocketContext}
 */
const SocketIOContext = createContext({
  connection: null,
  namespace: "",
  setConnection: null,
  setNamespace: null,
  createConnection: null,
  emitOnJoin: true,
  setEmitOnJoin: null
});


export function useSocket() {
  return useContext(SocketIOContext);
}

export function SocketProvider({ children }) {

  /**
   * @type {[import("socket.io-client").Socket, (arg0: Socket | null) => void] }
   */
  const [connection, setConnection] = useState(null);
  const [namespace, setNamespace] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [emitOnJoin, setEmitOnJoin] = useState(true);

  /**
   * @param {string} namespace
   * @returns {import("socket.io-client").Socket}
   */
  function createConnection(namespace) {
    console.log(namespace);
    const socketIO = io("http://localhost:3200/"+namespace);
    console.log(socketIO);
    setConnection(socketIO);
  }

  useEffect(() => {
    if (!connection) return;

    connection.on("connect", () => {
      setConnectionStatus("connected");
    });

    connection.on("disconnect", (reason) => {
      console.log(reason);
      setConnectionStatus("disconnected");
    });

    return () => {
      connection.off("connect");
      connection.off("disconnect");
    };
  }, [connection]);

  return (
    <SocketIOContext.Provider
      value={{
        connection,
        namespace,
        setConnection,
        setNamespace,
        createConnection,
        connectionStatus,
        emitOnJoin,
        setEmitOnJoin: setEmitOnJoin
      }}
    >
      {children}
    </SocketIOContext.Provider>
  );
}
