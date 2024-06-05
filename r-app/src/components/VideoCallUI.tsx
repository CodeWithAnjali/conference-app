import "./VideoCallUI.css";
import VideoUI from "./VideoUI";

type VideoCallUIProps = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
};

export default function VideoCallUI({ localStream, remoteStream }: VideoCallUIProps) {

  return (
    <div className="video-call-container">
      <VideoUI stream={localStream} label="Abhishek Mourya" />
      <VideoUI stream={remoteStream} label="Naron" />
    </div>
  );
}
