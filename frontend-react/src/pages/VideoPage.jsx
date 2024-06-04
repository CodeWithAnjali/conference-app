import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useCallManager } from '../hooks/CallManager';
import VideoCallUI from '../components/VideoCallUI';
import "./VideoPage.css";



const VideoPage = () => {

  const { IsLoggedIn, loaded } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { connection, setNamespace, connectionStatus, createConnection, } = useSocket();
 
  const { createCallOffer, localStream, remoteStream } = useCallManager();

  useEffect(() => {
    IsLoggedIn().then(({ result, user }) => {
      console.log(result);
      if (loaded && !user) {
        navigate("/authenticate");
      }
    });
      
    if (!id) {
      navigate("/");
    }
  }, [IsLoggedIn, loaded, navigate])

  useEffect(() => {
    if (!connection) {
      createConnection(id);
      setNamespace(id);
    }
  }, [connection, id, createConnection, setNamespace])


  useEffect(() => {
    if (!connection) return;
    connection.on("on-join", async ({ socketId }) => {
      console.log(socketId);
      await createCallOffer();
    })
  }, [connection]);

  return (
    <div className="videopage-container">
      <VideoCallUI localStream={localStream} remoteStream={remoteStream} />
    </div>
  )
}

export default VideoPage
