import { useEffect, useState } from "react";
import { useSocketIO } from "./socektIOHook";

/**
 * @type{RTCConfiguration}
 */
const iceConfigurations = {
    iceServers: [
        {
            urls: [
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302",
            ],
        },
    ],
};

/**
 * @param {UseRTCProps} param0 
 * @returns {{ localStream: MediaStream, remoteStream: MediaStream }}
 */
export function useJoinPageRTC({ uid, username, roomId }) {


  /**
   * @type {[RTCPeerConnection, (m: RTCPeerConnection) => void]}
   */
  const [peerConnection, setPeerConnection] = useState(null);

  /**
   * @type {[MediaStream, (m: MediaStream) => void]}
   */
  const [localStream, setLocalStream] = useState(null);

  /**
   * @type {[MediaStream, (m: MediaStream) => void]}
   */
  const [remoteStream, setRemoteStream] = useState(null);
  const { connection, connectionStatus } = useSocketIO("http://localhost:3200");

  /**
   * @type {[RTCIceCandidate[], (ice: RTCIceCandidate[]) => void]}
   */
  const [icecandidates, setIcecandidates] = useState([]);


  useEffect(() => {
    const pc = new RTCPeerConnection(iceConfigurations);
    window.pc = pc;

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
    connection.on("recv-ice-candidate", async ({candidate}) => {
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

  return { localStream, remoteStream }
}