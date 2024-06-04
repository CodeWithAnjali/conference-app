import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useCallManager } from '../hooks/CallManager';

const VideoPage = () => {

  const { user, IsLoggedIn, loaded } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const {connection, setNamespace, connectionStatus, createConnection} = useSocket();

  const { createCallOffer } = useCallManager();

  useEffect(() => {
    IsLoggedIn().then(({ result, user }) => {
      if (loaded && !user) {
        navigate("/authenticate");
      }
    })
    if (!id) {
      navigate("/");
    }
  }, [user, id, navigate]);


  useEffect(() => {
    if (!connection) {
      createConnection(id);
      setNamespace(id);
    }
  }, [connection, id, createConnection, setNamespace])


  useEffect(() => {
    if(!connection) return;
    connection.on("on-join", ({ username }) => {
      console.log(username);
      createCallOffer();
    });
  }, [connection, createCallOffer]);

  return (
    <div style={{ color: 'white' }}>

    {connectionStatus}
    </div>
  )
}

export default VideoPage
