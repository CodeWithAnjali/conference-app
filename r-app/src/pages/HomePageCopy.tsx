import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomAndUserContext } from "../contexts/ManageRoomAndUser";


export default function HomePage() {
    const [usernameInput, setUsernameInput] = useState("");
    const [uid, setUID] = useState("")
    const { setUserName, setRoomId, setJoining, setUID: setContextUID } = useRoomAndUserContext();
    const navigate = useNavigate();


    async function getRoomID() {
        const body = JSON.stringify({ uid: uid });
        console.log(body);
        const response = await fetch("https://kubernetes.glxymesh.com/create-room", {
            method: "POST",
            body,
            headers: {
                "content-type": "application/json"
            }
        });
        
        const { roomId }: { roomId: string } = await response.json();
        navigate(`/room/${roomId}`);
        setUserName!(usernameInput);
        setRoomId!(roomId);
        setContextUID!(uid);
        setJoining!(false);
    }

    return (
        <form onSubmit={async (e) => {
            e.preventDefault();
            await getRoomID();
        }}>
            <div>
                <label>Username: <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)}  /></label>
                <label>UID: <input type="text" value={uid} onChange={(e) => setUID(e.target.value)}  /></label>
            </div>
            <button type="submit">Create Conference Room</button>
        </form>
    )
}