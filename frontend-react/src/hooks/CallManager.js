import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";


const peerConnection = new RTCPeerConnection();

export function useCallManager() {
    const [icecandidates, setIceCandidates] =  useState([]);

    /**
     * @type {[MediaStream, (s: MediaStream) => void]}
     */
    const [localStream, setLocalStream] = useState(null);
    
    /**
     * @type {[MediaStream, (s: MediaStream) => void]}
     */
    const [remoteStream, setRemoteStream] = useState(null);
    
    const {connection} = useSocket();

    useEffect(() => {
        navigator.mediaDevices.getDisplayMedia({
            video: true
        }).then((stream) => {
            stream.getTracks().forEach((track) => {
                peerConnection.addTrack(track);
            });
            setLocalStream(stream);
        })
    }, [localStream]);

    async function createCallOffer() {
        const offer =  await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        connection.emit("call-user", { offer });
    }

    async function answerCall({ offer }) {
        const sdp = new RTCSessionDescription(offer);
        await peerConnection.setRemoteDescription(sdp);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        connection.emit("answer-user", { answer });
    }

    useEffect(() => {
        connection.on("ice-candidate", addIceCandidate);
        connection.on("call-offer", answerCall);
        connection.on("on-answer", async ({ answer }) => {
            const answerSDP = new RTCSessionDescription(answer);
            await peerConnection.setRemoteDescription(answerSDP);
        })
    }, [connection])

    async function addIceCandidate(candidateString) {
        const candidate = new RTCIceCandidate(candidateString);
        if (icecandidates.length > 0) {
            icecandidates.forEach(async (c) => await peerConnection.addIceCandidate(c));
        }
        await peerConnection.addIceCandidate(candidate);
    }

    useEffect(() => {
        peerConnection.onicecandidate = (ev) => {
            if (peerConnection.localDescription && !peerConnection.remoteDescription) {
                setIceCandidates([...icecandidates, ev.candidate]);
                return;
            }
            console.log("Received Ice Candidate", ev.candidate);
            if (!ev.candidate) return;
            peerConnection.addIceCandidate(ev.candidate);
        }

        peerConnection.onnegotiationneeded = (ev) => {
            console.log("negotiation is needed");
        }
    }, [])

    return { peerConnection, createCallOffer, answerCall, addIceCandidate };
}