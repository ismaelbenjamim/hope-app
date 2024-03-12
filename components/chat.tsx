'use client'

import { useChat, type Message } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { AudioState, ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import EasySpeech from 'easy-speech'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  //const synth = window.speechSynthesis
  const [onAudio, setOnAudio] = useState<boolean>(false)
  const [audioState, setAudioState] = useState<AudioState>(AudioState.INATIVE)

  const request: any = {
    maxTimeout: 5000,
    interval: 1,
    quiet: true
  }

  const outputAudio = async () => {
    const ultimoElemento: Message = messages[messages.length - 1]
    await EasySpeech.init(request)
    await EasySpeech.speak({
      text: ultimoElemento.content,
      voice: EasySpeech.voices()[0],
      infiniteResume: true,
      start: event => {
        setAudioState(AudioState.CONTINUE)
      },
      end: event => {
        setAudioState(AudioState.STOP)
      }
    })
      .then()
      .catch(e => {})
  }

  const verifyAudio = async () => {
    await EasySpeech.init(request);
    if (audioState == AudioState.INATIVE) {
      setOnAudio(false)
      await EasySpeech.pause()
      await EasySpeech.cancel()
    } else if (audioState == AudioState.CONTINUE) {
      setOnAudio(true)
      await EasySpeech.resume()
    } else if (audioState == AudioState.PAUSE) {
      setOnAudio(true)
      await EasySpeech.pause()
    } else if (audioState == AudioState.STOP) {
      setOnAudio(false)
      await EasySpeech.pause()
      await EasySpeech.cancel()
    } else if (audioState == AudioState.RESTART) {
      setOnAudio(true)
      await outputAudio()
    }
  }

  React.useEffect(() => {
    verifyAudio()
  }, [audioState])

  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      initialMessages,
      id,
      body: {
        id,
        previewToken
      },
      async onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish() {
        if (!path.includes('chat')) {
          window.history.pushState({}, '', `/chat/${id}`)
        }
      }
    })
  React.useEffect(() => {
    if (!isLoading && messages.length) {
      outputAudio()
    }
  }, [isLoading])

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
        OnAudio={onAudio}
        setOnAudio={setOnAudio}
        audioState={audioState}
        setAudioState={setAudioState}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
