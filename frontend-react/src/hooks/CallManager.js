import { useEffect, useState } from "react";
import { useSocket } from "../contexts/SocketContext";


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

const peerConnection = new RTCPeerConnection({
    iceServers: iceConfigurations.iceServers,
    iceCandidatePoolSize: 10
});

export function useCallManager() {
    const [icecandidates, setIceCandidates] =  useState([]);

    /**
     * @type {[MediaStream, (s: MediaStream) => void]}
     */
    const [localStream, setLocalStream] = useState(null);

    /**
     * @type {[ MediaStream, (s: MediaStream) => void]}
     */
    const [remoteStream, setRemoteStream] = useState(null);
    
    const { connection } = useSocket();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
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
        if (!connection) return;
        connection.on("ice-candidate", addIceCandidate);
        connection.on("call-offer", answerCall);
        connection.on("on-answer", async ({ answer }) => {
            const answerSDP = new RTCSessionDescription(answer);
            await peerConnection.setRemoteDescription(answerSDP);
        })

        return () => {
            connection.off("ice-candidate")
            connection.off("call-offer")
            connection.off("on-answer")
        }
    }, [connection])

    useEffect(() => {
        peerConnection.ontrack = ev => {
            setRemoteStream(ev.streams[0]);
        }
    }, [])

    async function addIceCandidate(candidateString) {
        const candidate = new RTCIceCandidate(candidateString);
        if (icecandidates.length > 0) {
            icecandidates.forEach(async (c) => await peerConnection.addIceCandidate(c));
        }
        await peerConnection.addIceCandidate(candidate);
    }

    useEffect(() => {
        if (!peerConnection) return;
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