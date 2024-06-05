import { useEffect, useState } from "react";
import { useSocketIO } from "./socektIOHook";

/**
 * @type{RTCConfiguration}
 */
const iceConfigurations = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

/**
 * @param {UseRTCProps} param0
 * @returns {{ localStream: MediaStream, remoteStream: MediaStream }}
 */
export function useCallPageRTC({ uid, username }) {
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
  const [otherPersonUID, setOtherPersonUID] = useState("");

  useEffect(() => {
    const pc = new RTCPeerConnection(iceConfigurations);
    window.pc = pc;

    console.log("Use Peer connection", pc);

    pc.ontrack = (ev) => {
      const remoteStream = new MediaStream();
      ev.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream);
    };

    pc.onicecandidate = (ev) => {
      const candidate = ev.candidate;
      if (!candidate) return;
      if (pc.localDescription && !pc.remoteDescription) {
        setIcecandidates([...icecandidates, candidate]);
        return;
      }
      pc.addIceCandidate(candidate);
      console.log("Local Ice Candidate Added");

      connection.emit("creator-ice-candidate", {
        candidate: candidate.toJSON(),
        otherUID: otherPersonUID,
      });
    };

    pc.onnegotiationneeded = (ev) => {
      console.log("Negotiation is needed", ev);
    };

    setPeerConnection(pc);
  }, []);

  async function addLocalStream() {
    if (!peerConnection) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream.getTracks().forEach((track) => {
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
  }, [connectionStatus]);

  useEffect(() => {
    if (connectionStatus !== "connected") return;
    console.log("Listening socketIO Events");
    connection.on("call-offer", async ({ offer, otherUID }) => {
      setOtherPersonUID(otherUID);
      console.log("Call Offer Received", otherPersonUID, otherUID);
      if (!peerConnection) {
        console.log("Peer Connection Not Found on Call Offer");
        return;
      }

      const remoteSDP = new RTCSessionDescription(offer);
      await peerConnection.setRemoteDescription(remoteSDP);
      await addLocalStream();
      const answerSDP = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answerSDP);
      connection.emit("answer-call", { otherUID, answer: answerSDP });
    });

    connection.on("recv-ice-candidate", async ({ candidate }) => {
      if (!peerConnection) {
        console.log("Peer Connection Not Found");
        return;
      }
      console.log("Remote Ice Candidate Added");
      await peerConnection.addIceCandidate(candidate);
      console.log("Ice Candidate Added");
    });
  }, [connectionStatus]);

  return {
    localStream,
    remoteStream,
    connection,
    connectionStatus,
    peerConnection,
    JoinRoom,
    addLocalStream,
  };
}
