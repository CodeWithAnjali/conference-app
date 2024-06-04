async function createCallOffer() {
    const offer =  await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("Calling:", peerConnection);
    connection.emit("call-user", { offer });
}

async function answerCall({ offer }) {
    console.log("Offer:", offer);
    const sdp = new RTCSessionDescription(offer);
    await peerConnection.setRemoteDescription(sdp);
    console.log(peerConnection);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    connection.emit("answer-user", { answer });
}

useEffect(() => {
    if (!connection) return;
    connection.on("ice-candidate", addIceCandidate);
    connection.on("call-offer", answerCall);
    connection.on("on-answer", async ({ answer }) => {
        console.log(answer);
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
        console.log("Getting the tracks");
        const remoteStream = new MediaStream();
        if (ev.streams.length > 0) {
            ev.streams[0].getTracks().forEach((track) => {
                console.log(track);
                remoteStream.addTrack(track);
            });
            setRemoteStream(remoteStream);
        }
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
        if (!connection) return;
        connection.emit("send-connection", { candidate: ev.candidate });
        console.log("Received Ice Candidate", ev.candidate);
        if (!ev.candidate) return;
        peerConnection.addIceCandidate(ev.candidate);
    }

    peerConnection.onnegotiationneeded = (ev) => {
        console.log("negotiation is needed");
        console.log(peerConnection);
    }
}, [icecandidates])