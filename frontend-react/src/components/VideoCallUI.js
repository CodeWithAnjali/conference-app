import VideoUI from "./VideoUI";

/**
 * 
 * @param {VideoCallUIProps} param0 
 * @returns 
 */
export default function VideoCallUI({ localStream, remoteStream }) {

  return (
    <div className="video-call-container">
      <VideoUI stream={localStream} label="Abhishek Mourya" />
      <VideoUI stream={remoteStream} label="Naron" />
    </div>
  );
}
