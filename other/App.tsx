import { useState, useRef } from "react";
import { pipeline } from "@huggingface/transformers";

async function blobToFloat32Array(
  blob: Blob
): Promise<{ samples: Float32Array; sampleRate: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0); // Float32Array view
  const samples = new Float32Array(channelData); // make an owned copy
  audioCtx.close();
  return { samples, sampleRate: audioBuffer.sampleRate };
}

export default function WhisperMic() {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [loadingModel, setLoadingModel] = useState(false);

  const transcriberRef = useRef(null);
  const mediaRecorderRef = useRef<MediaRecorder>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Load whisper-tiny.en on first use
  const loadModel = async () => {
    if (!transcriberRef.current) {
      setLoadingModel(true);
      transcriberRef.current = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small.en"
      );
      setLoadingModel(false);
    }
    return transcriberRef.current;
  };

  const startRecording = async () => {
    const transcriber = await loadModel();

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { noiseSuppression: false },
    });
    mediaRecorderRef.current = new MediaRecorder(stream);

    chunksRef.current = [];
    setRecording(true);

    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });

      const { samples } = await blobToFloat32Array(blob);

      setText("Transcribing...");

      const result = await transcriber(samples);
      setText(result.text);
      setRecording(false);
    };

    mediaRecorderRef.current.start(200); // collect chunks every 200ms
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Whisper Live Transcription</h2>

      {loadingModel && <p>Loading Whisper model (first time only)...</p>}

      {!recording ? (
        <button onClick={startRecording} disabled={loadingModel}>
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap", fontSize: 16 }}>
        {text}
      </pre>
    </div>
  );
}
