import { useEffect, useState } from 'react';
import './VideoCallPage.css';
import TranscriptionUI from '../components/TranscriptionUI';
import VideoCallUI from '../components/VideoCallUI';
import { useCallPageRTC } from "../hooks/useCallPageRTC";

import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;




export default function VideoCallPage() {

  const [selfTranscription, setSelfTranscription] = useState("");
  const [recognition, setRecognition] = useState();
  const navigate = useNavigate();

  const { loaded, user } = useAuth();
  
  const { localStream, remoteStream } = useCallPageRTC({ username: user.displayName, uid: user.uid });

  useEffect(() => {
    console.log(loaded, user)
    if (loaded && !user) {
      navigate("/authenticate");
    } 
  }, [user, loaded, navigate])

  useEffect(() => {
    console.log(recognition);
    if ("SpeechRecognition" in window) {
      console.log("Recognizing");
      const recognition = new window.SpeechRecognition({});
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      console.log(recognition);

      setRecognition(recognition);

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";
  
        for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " ";
            } else {
              interimTranscript += transcript;
            }
        }
        setSelfTranscription(interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };
    }
  }, []);

  useEffect(() => {
    console.log(localStream, remoteStream);
  }, [localStream, remoteStream])

  return (
    <div className='video-call-page'>
      <VideoCallUI  localStream={localStream} remoteStream={remoteStream}  />
      {selfTranscription && <TranscriptionUI selfContent={selfTranscription} otherContent={selfTranscription} />}
    </div>
  )
}
