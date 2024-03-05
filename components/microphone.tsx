'use client'

import { useRecordVoice } from '@/app/hooks/useRecordVoice'
import { IconMicrophone } from './ui/icon-microphone'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { IconDownload, IconStop } from './ui/icons'

interface MicrophoneProps {
  onAudio: (value: any) => void
  onSubmit: (value: any) => void
}

const Microphone: React.FC<MicrophoneProps> = ({ onAudio, onSubmit }) => {
  //const { recording, startRecording, stopRecording, text, setText } = useRecordVoice()

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const [recording, setRecording] = useState<Boolean>(false);
  const [text, setText] = useState<string>('');

  const startRecording = () => {
    setRecording(true);
    recognition.start();
  }
  
  const stopRecording = () => {
    setRecording(false);
    recognition.stop();
  }

  const handleClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
      recognition.onresult = async function(event) {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
      }
    }
  }

  React.useEffect(() => {
    if (text) {
      console.log(text)
      onSubmit(text)
      setText('')
    }
  }, [text, onAudio])

  return (
    <div className="flex flex-col justify-center items-center">
      <Button
        variant={(recording ? "destructive" : "outline")}
        onClick={handleClick}
      >
        <IconMicrophone className="mr-0" />
      </Button>
    </div>
  )
}

export { Microphone }
