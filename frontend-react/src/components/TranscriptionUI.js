import"./TranscriptionUI.css";

/**
 * 
 * @param {TranscriptionUIProps} param0 
 * @returns 
 */
export default function TranscriptionUI({ otherContent, selfContent }) {
    return (
        <div className="transcription-container">
            <p className="self"><span>You: </span>{selfContent}</p>
            <p className="other"><span>Other: </span>{otherContent}</p>
        </div>
    )
}