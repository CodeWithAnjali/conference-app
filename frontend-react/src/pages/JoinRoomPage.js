import { useEffect, useState } from "react";
import TranscriptionUI from "../components/TranscriptionUI";
import VideoCallUI from "../components/VideoCallUI";
import "./VideoCallPage.css";

import { useJoinPageRTC } from "../hooks/useJoinPageRTC"
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;


export default function JoinRoomPage() {
    const [selfTranscription, setSelfTranscription] = useState("");
    const [recognition, setRecognition] = useState();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const { loaded, user } = useAuth();
    
    useEffect(() => {
      console.log(loaded, user)
      if (loaded && !user) {
        navigate("/authenticate");
      } 
    }, [user, loaded, navigate])
    
    let localStream, remoteStream = useJoinPageRTC({ username: user.displayName, uid: user.uid });
    
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

    if (!id) {
      console.log("Room ID Not Found", id)
      navigate("/")
      return;
    }

    return (
      <div className='video-call-page'>
        <VideoCallUI  localStream={localStream} remoteStream={remoteStream}  />
        {selfTranscription && <TranscriptionUI selfContent={selfTranscription} otherContent={selfTranscription} />}
      </div>
    )
}