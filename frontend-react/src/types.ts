import {Socket} from "socket.io-client";
export interface UseRecordingContext {
    what: string
}

type ConnectionStatus = "connected" | "disconnected"

export type SocketContextData = {
    namespace: string | null,
    connection: Socket | null,
    setConnection: (arg0: Socket) => void,
    setNamespace: (arg0: string) => void,
    connectionStatus: ConnectionStatus,
    createConnection: (namespace: string) => void
}

export type SocketContext = React.Context<SocketContextData>