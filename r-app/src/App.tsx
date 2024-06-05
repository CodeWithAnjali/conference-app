import { BrowserRouter, Route, Routes } from "react-router-dom";
import VideoCallPage from "./pages/VideoCallPage";
import { RoomAndUserContextProvider } from "./contexts/ManageRoomAndUser";
import HomePage from "./pages/HomePage";
import JoinRoomPage from "./pages/JoinRoomPage";

export default function App() {
    return (
        <BrowserRouter>
            <RoomAndUserContextProvider>
                <Routes>
                    <Route path="/" Component={HomePage} />
                    <Route path="/room/:id" Component={VideoCallPage} />
                    <Route path="/room/join/:id" Component={JoinRoomPage} />
                </Routes>
            </RoomAndUserContextProvider>
        </BrowserRouter>
    )
}