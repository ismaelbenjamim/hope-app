"use client";
import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "../utils/blobToBase64";
import { createMediaStream } from "../utils/createMediaStream";

interface UseRecordVoiceResult {
  recording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  text: string;
  setText: (value: string) => void;
}

export const useRecordVoice = (): UseRecordVoiceResult => {
  const [text, setText] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const isRecording = useRef<boolean>(false);
  const chunks = useRef<Array<Blob>>([]);

  const startRecording = () => {
    if (mediaRecorder) {
      isRecording.current = true;
      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const getText = async (base64data: string) => {
    try {
      setText("Olá");
    } catch (error) {
      console.log(error);
    }
  };

  const initialMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      createMediaStream(stream, null, null);
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev) => {
      chunks.current.push(ev.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(chunks.current, { type: "audio/wav" });
      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(initialMediaRecorder);
    }
  }, []);

  return { recording, startRecording, stopRecording, text, setText };
};