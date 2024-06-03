import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VideoPage from "./pages/VideoPage";
import AuthenticatePage from "./pages/AuthPage";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

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
      element: <VideoPage />,
    },
  ]);

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="App">
          <RouterProvider router={router} />
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
