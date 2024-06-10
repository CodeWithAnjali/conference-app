import { useEffect, useRef } from "react";
import "./VideoUI.css";


type VideoUIProps = {
    label: string,
    stream: MediaStream |null,
    muted: boolean
}

export default function VideoUI({ label, stream, muted  }: VideoUIProps) {

    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        videoRef.current!.srcObject = stream
    }, [stream]);

    return (
        <div className="video-c">
            <button className="pin-video-btn">
                🧷
            </button>
            <video playsInline autoPlay muted={muted} ref={videoRef}></video>
            <span>{label}</span>
        </div>
    )
}