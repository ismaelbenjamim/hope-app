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
  if (!window.SpeechRecognition) {
    if (!window.webkitSpeechRecognition) {
      return (
        <div className="flex flex-col justify-center items-center">
          <Button
            type="button"
            disabled={true}
            variant={'outline'}
          >
            <IconMicrophone className="mr-0" />
          </Button>
        </div>
      )
    }
    window.SpeechRecognition = window.webkitSpeechRecognition
  }
  //const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  const recognition = new window.SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = 'pt-BR'

  const [isListening, setListening] = useState<boolean>(false)
  const isListeningRef = React.useRef(isListening)
  const [text, setText] = useState<string>('')

  React.useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  const handleStart = async () => {
    setListening(true)
    recognition.start()
  }

  const handleStop = () => {
    setListening(false)
    recognition.stop()
  }

  recognition.onresult = async event => {
    if (isListeningRef.current) {
      let concatenatedText = ''
      for (let i = 0; i < event.results.length; i++) {
        concatenatedText += event.results[i][0].transcript
      }
      setText(concatenatedText.trim())
    } else {
      handleStop()
    }
  }

  recognition.onaudioend = event => {
    handleStop()
  }

  recognition.onend = event => {
    handleStop()
  }

  /*React.useEffect(() => {
    if (isListening) {
      console.log('ouvindo')
      handleStart();
    } else {
      console.log('parando')
      handleStop();
    }
  }, [isListening])*/

  React.useEffect(() => {
    onAudio(text)
    if (text && !isListening) {
      onSubmit(text)
      setText('')
    }
  }, [text, isListening, onAudio])

  return (
    <div className="flex flex-col justify-center items-center">
      <Button
        type="button"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={() => (isListening ? handleStop() : handleStart())}
      >
        <IconMicrophone className="mr-0" />
      </Button>
    </div>
  )
}

export { Microphone }
