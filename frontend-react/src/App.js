import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthenticatePage from "./pages/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import VideoCallPage from "./pages/VideoCallPage";
import JoinRoomPage from "./pages/JoinRoomPage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/authenticate",
      element: <AuthenticatePage />,
    },
    {
      path: "/room/:id",
      Component: VideoCallPage,
    }, 
    {
      path: "/room/join/:id",
      Component: JoinRoomPage
    }
  ]);

  return (
    <AuthProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
