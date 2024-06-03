/**
 *
 * @param {UseRecordingContext}
 */
export default function useRecording() {
    const canvasRef = useRef();


    return {
        canvasRef,
    }
}