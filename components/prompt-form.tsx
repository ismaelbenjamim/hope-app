import * as React from 'react'
import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { Microphone } from './microphone'
import { Badge } from './ui/badge'

export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
}

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const [ showNotSupported, setShowNotSupported ] = React.useState<boolean>(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const [isListening, setListening] = React.useState<boolean>(false)
  const isListeningRef = React.useRef(isListening)
  const [text, setText] = React.useState<string>('')

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  React.useEffect(() => {
    if (!window.SpeechRecognition) {
      if (!window.webkitSpeechRecognition) {
        setShowNotSupported(true);
        setTimeout(() => {
          setShowNotSupported(false);
        }, 7000)
      }
    }
  }, []);

  
  React.useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  
  React.useEffect(() => {
    setInput(text)
    if (text && !isListening) {
      onSubmit(text)
      setText('')
    }
  }, [text, isListening, setInput])

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        setText('')
        setListening(false)
        await onSubmit(input)
      }}
      ref={formRef}
    >
      {showNotSupported && (
        <div className="flex h-full items-center justify-center p-1 mb-3">
        <Badge variant="destructive" className='justify-center'>Reconhecimento de voz não é suportado por este navegador</Badge>
        </div>
      )}
      <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                router.refresh()
                router.push('/')
              }}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4'
              )}
            >
              <IconPlus />
              <span className="sr-only">Nova Conversa</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Nova Conversa</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Envie uma mensagem."
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
        <div className="absolute right-0 top-4 sm:right-4">
          <div className="flex">
            <div className="pe-2">
              <Microphone 
              onAudio={setInput} 
              onSubmit={onSubmit} 
              isListening={isListening}
              setListening={setListening}
              isListeningRef={isListeningRef}
              text={text}
              setText={setText}
              />
            </div>
            <div className="pe-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading || input === ''}
                  >
                    <IconArrowElbow />
                    <span className="sr-only">Enviar mensagem</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enviar mensagem</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
