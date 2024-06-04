import { useEffect, useRef } from "react";
import "./video-callui.css";

/**
 * @param {{ localStream: MediaStream, remoteStream: MediaStream }}
 */
export default function VideoCallUI({ localStream, remoteStream }) {
  /**
   * @type {React.MutableRefObject<HTMLVideoElement>}
   */
  const localStreamRef = useRef(null);
  /**
   * @type {React.MutableRefObject<HTMLVideoElement>}
   */
  const remoteStreamRef = useRef(null);


  useEffect(() => {
    if(localStreamRef.current && localStream) {
        localStreamRef.current.srcObject = localStream
    }
  }, [localStream]);

  useEffect(() => {
    if(remoteStreamRef.current && remoteStream) {
        remoteStreamRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

    return (
        <div className="videocall-ui">
            <video width={"640px"} playsInline autoPlay ref={localStreamRef}></video>
            <video width={"640px"} playsInline autoPlay ref={remoteStreamRef}></video>
        </div>
    )
}



