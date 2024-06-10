import "./VideoCallUI.css";
import VideoUI from "./VideoUI";

type VideoCallUIProps = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export default function VideoCallUI({ localStream, remoteStream }: VideoCallUIProps) {

  return (
    <div className="video-call-container">
      <VideoUI stream={localStream} muted={true} label="Abhishek Mourya" />
      <VideoUI stream={remoteStream} muted={false} label="Naron" />
    </div>
  );
}
