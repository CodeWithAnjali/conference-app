import { User } from "firebase/auth";
import {Socket} from "socket.io-client";
export interface UseRecordingContext {
    what: string
}

export type ConnectionStatus = "connected" | "disconnected"

export type SocketContextData = {
    namespace: string | null,
    connection: Socket | null,
    setConnection: (arg0: Socket) => void,
    setNamespace: (arg0: string) => void,
    connectionStatus: ConnectionStatus,
    createConnection: (namespace: string) => void,
    emitOnJoin: boolean,
    setEmitOnJoin: (s: boolean) => void
}

export type SocketContext = React.Context<SocketContextData>


export type IsLoggedInFunctionResult = {
    result: boolean,
    user: User | null
}

export type TranscriptionUIProps = {
    otherContent: string,
    selfContent: string
}

export type VideoUIProps = {
    label: string,
    stream: MediaStream |null
}

export type UseRTCProps = { uid: string, username: string, roomId: string};

