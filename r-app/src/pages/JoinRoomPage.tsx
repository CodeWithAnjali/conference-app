import { useEffect, useState } from "react";
import TranscriptionUI from "../components/TranscriptionUI";
import VideoCallUI from "../components/VideoCallUI";
import "./VideoCallPage.css";
import { useSocketIO } from "../hooks/socektIOHook";
import { UseRTCProps } from "../types";
import { useNavigate, useParams } from "react-router-dom";
import { v4 } from "uuid";


const iceConfigurations: RTCConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ],
        },
    ],
};

function useRTC({ uid, username, roomId }: UseRTCProps) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection|null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { connection, connectionStatus } = useSocketIO("https://kubernetes.glxymesh.com");
  const [icecandidates, setIcecandidates] = useState<RTCIceCandidate[]>([]);

  useEffect(() => {
    const pc = new RTCPeerConnection(iceConfigurations);
    (window as any).pc = pc;

    pc.ontrack = (ev) => {
      const remoteStream = new MediaStream();
      ev.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
    }

    pc.onicecandidate = (ev) => {
      const candidate = ev.candidate;
      console.log("Local Ice Candidate Added")
      if (!candidate) return;
      connection.emit("joined-ice-candidate", { icecandidate: candidate.toJSON(), roomId });
      if (pc.localDescription && !pc.remoteDescription) {
        setIcecandidates([...icecandidates, candidate]);
        return;
      } else {
        pc.addIceCandidate(candidate);
      }
    }

    pc.onnegotiationneeded = (ev) => {
      console.log("Negotiation is needed", ev);
    }

    setPeerConnection(pc);
  }, [])

  useEffect(() => {
    if (connectionStatus === "connected") {
      JoinRoom();
    }
  }, [connectionStatus]);

  async function addLocalStream() {
    if (!peerConnection) return;
    console.log("Adding Local Stream")
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });

    setLocalStream(stream);
  }

  async function JoinRoom() {
    connection.emit("join-room", { uid, username });
    await addLocalStream();
    await createCallOffer();
  }

  async function createCallOffer() {
    if (!peerConnection) {
      console.log("Can't Create Call");
      return;
    };
    console.log("Call Offer Creationg and Sending")

    const offer = await peerConnection.createOffer()
    peerConnection.setLocalDescription(offer);

    connection.emit("call-user", { offer, roomId, uid });
  }

  useEffect(() => {
    if (connectionStatus !== "connected") return;
    connection.on("recv-ice-candidate", async ({candidate}: { candidate: RTCIceCandidateInit}) => {
      if (!peerConnection) {
        console.log("Peer Connection Not Found");
        return;
      }
      console.log("Remote Ice Candidate Added")
      await peerConnection.addIceCandidate(candidate);
      console.log("Ice Candidate Added");
    })

    connection.on("on-answer", async ({answer}) => {
      const answerSDP = new RTCSessionDescription(answer);
      if (!peerConnection) {
        console.log("No Peerconnection on answer")
        return;
      }
      await peerConnection?.setRemoteDescription(answerSDP);
    });
  }, [connectionStatus]);

  return { localStream, remoteStream, connection, connectionStatus, peerConnection, JoinRoom, addLocalStream, createCallOffer, }
}

function CallComponent({ uid, roomId, username }: { uid: string, roomId: string, username: string }) {
  const [selfTranscription, setSelfTranscription] = useState("");
  const [recognition, setRecognition] = useState<any>();

  const { localStream, remoteStream } = useRTC({ uid: uid, roomId: roomId, username: username });

  useEffect(() => {
    console.log(recognition);
    if ("SpeechRecognition" in window) {
      console.log("Recognizing");
      const recognition = new (window as any).SpeechRecognition({});
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      console.log(recognition);

      setRecognition(recognition);

      recognition.onresult = (event: any) => {
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

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
      };
    }
}, []);

  return (
    <div className='video-call-page'>
        <VideoCallUI  localStream={localStream} remoteStream={remoteStream}  />
        {selfTranscription && <TranscriptionUI selfContent={selfTranscription} otherContent={selfTranscription} />}
    </div>
  )
}

export default function JoinRoomPage() {
    
    const navigate = useNavigate();

    const [username, setUsername] = useState<string | null>(null);
    const [userNameInput, setUserNameInput] = useState("");
    const [selfUID, setselfUID] = useState<string>("");

    const { id } = useParams();
    if (!id) {
        console.log("Room ID Not Found", id)
        navigate("/")
        return;
    }
    

    useEffect(() => {
      console.log(username, selfUID)
    }, [username, selfUID])

    if (username) {
      console.log(username);
      return <CallComponent roomId={id} username={username} uid={selfUID} />
    } else {
      return <div className='video-call-page'>
        <div style={{ width: "600px", height: "400px"}}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            setUsername(userNameInput)
            setUserNameInput("");
            const userID = v4();
            setselfUID(userID);
          }}>
            <input type="text" placeholder='Enter your name' value={userNameInput} onChange={(e) => setUserNameInput(e.target.value)} />
            <button className="create-conference-btn">Create Conference Room</button>
          </form>
        </div>
      </div>
    }
}