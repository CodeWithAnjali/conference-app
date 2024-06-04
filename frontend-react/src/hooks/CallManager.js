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

window.peerConnection = peerConnection;

export function useCallManager() {
    /**
     * @type{[RTCPeerConnection, (s: RTCPeerConnection) => void]}
     */
    const [RTCConnection, setRTCConnection] = useState(null);

    /**
     * @type{[RTCIceCandidate[], (c: RTCIceCandidate[]) => void]}
     */
    const [icecandidates, setIceCandidates] =  useState([]);

    /**
     * @type {[MediaStream, (m: MediaStream) => void]}
     */
    const [localStream, setLocalStream] = useState(null)
    /**
     * @type {[MediaStream, (m: MediaStream) => void]}
     */
    const [remoteStream, setRemoteStream] = useState(null)
    
    const { connection } = useSocket();

    useEffect(() => {
        const peerConnection = new RTCPeerConnection({
            iceServers: iceConfigurations.iceServers,
            iceCandidatePoolSize: 10
        })
        window.peerConnection = peerConnection;
        setRTCConnection(peerConnection)
    },[])

    useEffect(() => {
        if (!connection && !RTCConnection) return;
        connection.on("recv-user-details", ({ username }) => {
            console.log("Other User Name: ", username);
        })

        connection.on("call-offer", async ({ offer }) => {
            console.log("Offer Received: ",offer);
            const remoteOffer = new RTCSessionDescription(offer);
            await RTCConnection.setRemoteDescription(remoteOffer);

            const localDescription = await RTCConnection.createAnswer();
            await RTCConnection.setLocalDescription(localDescription);

            connection.emit("answer-user", { answer: localDescription });
        })

        connection.on("ice-candidate", async ({ candidate }) => {
            if (candidate) {
                console.log("Ice candidate from other user", candidate);
                const c = new RTCIceCandidate(candidate);
                await RTCConnection.addIceCandidate(c);
            }
        })

        connection.on("on-answer", async ({ answer }) => {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true
            })
            stream.getTracks().forEach((track) => {
                console.log("Adding Tracks")
                RTCConnection.addTrack(track);
            });
            const remoteDescription = new RTCSessionDescription(answer);
            console.log("Answer Received: ", answer);
            await RTCConnection.setRemoteDescription(remoteDescription);
        })

        return () => {
            connection.off("recv-user-details");
            connection.off("call-offer");
            connection.off("ice-candidate");
            connection.off("on-answer");
        }

    }, [connection, RTCConnection])

    async function createCallOffer() {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true
        })
        stream.getTracks().forEach((track) => {
            console.log("Adding Tracks")
            RTCConnection.addTrack(track);
        });
        setLocalStream(stream);
        const localDescription = await RTCConnection.createOffer();
        await RTCConnection.setLocalDescription(localDescription);
        console.log(localDescription);
        connection.emit("call-user", { offer: localDescription });
    }


    useEffect(() => {
        if (!RTCConnection) return;
    
        RTCConnection.onicecandidate = async (ev) => {
            console.log(ev.candidate);
            if (!ev.candidate) return;
            if (!RTCConnection.remoteDescription) {
                console.log(icecandidates);
                setIceCandidates([...icecandidates, ev.candidate]);
            } else {   
                await RTCConnection.addIceCandidate(ev.candidate);
            }
            connection.emit("send-ice-candidate", { candidate: ev.candidate.toJSON() });
        }
    
        console.log("Listening for tracks");
        RTCConnection.ontrack = (ev) => {
            console.log(ev, "Track event occurred");
            const remoteStream = new MediaStream();
            if (ev.streams.length > 0) {
                ev.streams[0].getTracks().forEach((track) => {
                    console.log(track);
                    remoteStream.addTrack(track);
                });
                setRemoteStream(remoteStream); 
            }
        };

        RTCConnection.onnegotiationneeded =async (ev) => {
            console.log(ev, "Negotiation Needed")
        }
    
        return () => {
            RTCConnection.onicecandidate = null;
            RTCConnection.ontrack = null;
        };
    }, [RTCConnection, icecandidates]);

    

    return { peerConnection: RTCConnection, createCallOffer, localStream, remoteStream };
}