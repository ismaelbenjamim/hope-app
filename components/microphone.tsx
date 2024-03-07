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

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.lang = 'pt-BR'

  const [isListening, setListening] = useState<boolean>(false)
  const [text, setText] = useState<string>('')

  React.useEffect(() => {
    if (isListening) {
      recognition.start()
      recognition.onresult = async event => {
        let concatenatedText = ''
        for (let i = 0; i < event.results.length; i++) {
          concatenatedText += event.results[i][0].transcript
        }
        setText(concatenatedText.trim())
      }
      recognition.onaudioend = async event => {
        recognition.abort()
        recognition.stop()
      }
    } else {
      recognition.abort()
      recognition.stop()
    }
  }, [isListening])

  React.useEffect(() => {
    if (text && !isListening) {
      console.log(text)
      onSubmit(text)
      //onAudio(text)
      setText('')
    }
  }, [text, onAudio])

  return (
    <div className="flex flex-col justify-center items-center">
      <Button
        type="button"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={() => setListening(!isListening)}
      >
        <IconMicrophone className="mr-0" />
      </Button>
    </div>
  )
}

export { Microphone }
