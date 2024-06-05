import"./TranscriptionUI.css";

type TranscriptionUIProps = {
    otherContent: string,
    selfContent: string
}
export default function TranscriptionUI({ otherContent, selfContent }: TranscriptionUIProps) {
    return (
        <div className="transcription-container">
            <p className="self"><span>You: </span>{selfContent}</p>
            <p className="other"><span>Other: </span>{otherContent}</p>
        </div>
    )
}