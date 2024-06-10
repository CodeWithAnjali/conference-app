import { useEffect, useState } from 'react';
import './VideoCallPage.css';
import TranscriptionUI from '../components/TranscriptionUI';
import VideoCallUI from '../components/VideoCallUI';
import { useRoomAndUserContext } from '../contexts/ManageRoomAndUser';
import { useSocketIO } from '../hooks/socektIOHook';

(window as any).SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const iceConfigurations: RTCConfiguration = {
  iceServers: [
      {
        urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
        ],
      },
      {
          urls: "turns:kubernetes.glxymesh.com:5349",
          username: "abhishek",
          credential: "1234567"
      }
  ]
};

type UseRTCProps = { uid: string, username: string, roomId: string, joining: boolean}

function useRTC({ uid, username }: UseRTCProps) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection|null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { connection, connectionStatus } = useSocketIO("https://kubernetes.glxymesh.com");
  const [icecandidates, setIcecandidates] = useState<RTCIceCandidate[]>([]);
  const [remoteIceCandidates, setRemoteIceCandidates] = useState<RTCIceCandidate[]>([]);
  const [otherPersonUID, setOtherPersonUID] = useState("");


  useEffect(() => {
    const pc = new RTCPeerConnection(iceConfigurations);
    (window as any).pc = pc;
  
    console.log("Use Peer connection", pc);

    pc.ontrack = (ev) => {
      const remoteStream = new MediaStream();
      ev.streams[0].getTracks().forEach(track => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
    }

    

    pc.onnegotiationneeded = (ev) => {
      console.log("Negotiation is needed", ev);
    }

    setPeerConnection(pc);
  }, [])

  useEffect(() => {
    if (!peerConnection) return;
    peerConnection.onicecandidate = (ev) => {
      const candidate = ev.candidate;
      if (!candidate) return;
      if (peerConnection.localDescription && !peerConnection.remoteDescription) {
        setIcecandidates([...icecandidates, candidate]);
        return;
      }
      console.log(candidate);
      peerConnection.addIceCandidate(candidate);
      console.log("Local Ice Candidate Added");

      connection.emit("creator-ice-candidate", { icecandidate: candidate.toJSON(), otherUID: otherPersonUID });
    }
  }, [peerConnection, otherPersonUID])

  async function addLocalStream() {
    if (!peerConnection) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    stream.getTracks().forEach(track => {
      console.log(track)
      peerConnection.addTrack(track, stream);
    });
    setLocalStream(stream);
  }

  function JoinRoom() {
    connection.emit("join-room", { uid, username });
  }

  useEffect(() => {
    if (connectionStatus === "connected") {
      JoinRoom();
    }
  }, [connectionStatus])

  useEffect(() => {
    console.log({ otherPersonUID })
  }, [otherPersonUID])

  useEffect(() => {
    if (connectionStatus !== "connected") return;
    console.log("Listening socketIO Events");
    connection.on("call-offer", async ({ offer, otherUID }) => {
      setOtherPersonUID(otherUID);
      console.log({ otherUID, otherPersonUID });
      if (!peerConnection) {
        console.log("Peer Connection Not Found on Call Offer")
        return;
      }

      const remoteSDP = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteSDP);
      await addLocalStream();
      const answerSDP = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerSDP);
      connection.emit("answer-call", { otherUID, answer: answerSDP });
    });

    connection.on("recv-ice-candidate", async ({candidate}: { candidate: RTCIceCandidateInit}) => {
      if (!peerConnection) {
        console.log("Peer Connection Not Found");
        return;
      }
      
      console.log(candidate)
      const icObj = new RTCIceCandidate(candidate);
      if (!peerConnection.remoteDescription) {
        setRemoteIceCandidates([...remoteIceCandidates, icObj]);
        console.log("Added to Remote Ice candidate State")
      } else {
        console.log("Remote Ice Candidate Added");
        if (remoteIceCandidates.length > 0) {
          for (let remoteCandidate of remoteIceCandidates) {
            await peerConnection.addIceCandidate(remoteCandidate)
          }
        }
        await peerConnection.addIceCandidate(icObj);
        console.log("Ice Candidate Added");
      }
    })
  }, [connectionStatus]);

  return { localStream, remoteStream, connection, connectionStatus, peerConnection, JoinRoom, addLocalStream }
}


export default function VideoCallPage() {

  const [selfTranscription, setSelfTranscription] = useState("");
  const [recognition, setRecognition] = useState<any>();
  const { username, roomId, uid, joining } = useRoomAndUserContext();

  const { localStream, remoteStream } = useRTC({username: username!, roomId: roomId!, uid: uid!, joining: joining!});

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
