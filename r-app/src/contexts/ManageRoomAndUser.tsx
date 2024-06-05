import React, { createContext, useContext, useState } from "react";

type RoomAndUserContextData = {
    username?: string,
    setUserName?: (u: string) => void,
    roomId?: string,
    setRoomId?: (u: string) => void,
    uid?: string
    setUID?: (u: string) => void,
    otherPersonUID?: string,    
    setOtherPersonUID?: (u: string) => void,
    joining?: boolean
    setJoining?: (u: boolean) => void
}

const RoomAndUserContext = createContext<RoomAndUserContextData>({});

export function useRoomAndUserContext() {
    return useContext(RoomAndUserContext);
}


export function RoomAndUserContextProvider({ children }: { children: React.ReactNode }) {
    const [username, setUserName] = useState("");
    const [roomId, setRoomId] = useState("");
    const [uid, setUID] = useState("");
    const [joining, setJoining] = useState(true);
    const [otherPersonUID, setOtherPersonUID] = useState("");

    return (
        <RoomAndUserContext.Provider value={{
            username,
            setUserName,
            roomId, 
            setRoomId,
            uid,
            setUID,
            joining,
            setJoining,
            otherPersonUID, 
            setOtherPersonUID
        }}>
            {children}
        </RoomAndUserContext.Provider>
    )
}
