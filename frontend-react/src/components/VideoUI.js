import { useEffect, useRef } from "react";
import "./VideoUI.css";


/**
 * 
 * @param {VideoUIProps} param0 
 * @returns 
 */
export default function VideoUI({ label, stream  }) {

    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        videoRef.current.srcObject = stream
    }, [stream]);

    return (
        <div className="video-c">
            <button className="pin-video-btn">
                🧷
            </button>
            <video playsInline autoPlay ref={videoRef}></video>
            <span>{label}</span>
        </div>
    )
}