import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight, IconPause, IconRefresh, IconResume, IconStop } from '@/components/ui/icons'
import React from 'react';
import EasySpeech from 'easy-speech';
import { AudioState } from './chat-panel';

const exampleMessages = [
  {
    heading: 'Explorar Insights de Saúde',
    message: 'Você pode fornecer insights sobre como manter um estilo de vida equilibrado e saudável?'
  },
  {
    heading: 'Dicas de Bem-Estar',
    message: 'Compartilhe algumas dicas de bem-estar para melhorar a saúde mental e física.'
  },
  {
    heading: 'Recomendações de Saúde Personalizadas',
    message: 'Quais recomendações de saúde personalizadas você tem para mim com base no meu perfil?'
  }
];

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {

  const [audioState, setAudioState] = React.useState<AudioState>(AudioState.INATIVE)

  const request: any = {
    maxTimeout: 5000,
    interval: 1,
    quiet: true
  }

  const outputAudio = async () => {
    const text = "Bem vindo ao HopeIA, uma Inteligência artificial de Saúde. Estamos extremamente felizes em recebê-lo(a) em nossa plataforma dedicada à saúde. Na HopeIA, acreditamos que cada passo em direção ao bem-estar é uma jornada única e valiosa. Nossa inteligência artificial foi criada com o propósito de apoiar, informar e inspirar você em sua busca por uma vida saudável e equilibrada. Faça uma pergunta usando o chat ou pressione o botão de voz"
    await EasySpeech.init(request)
    await EasySpeech.speak({
      text: text,
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
      await EasySpeech.pause()
      await EasySpeech.cancel()
    } else if (audioState == AudioState.CONTINUE) {
      await EasySpeech.resume()
    } else if (audioState == AudioState.PAUSE) {
      await EasySpeech.pause()
    } else if (audioState == AudioState.STOP) {
      await EasySpeech.pause()
      await EasySpeech.cancel()
    } else if (audioState == AudioState.RESTART) {
      await outputAudio()
    }
  }

  React.useEffect(() => {
    verifyAudio()
  }, [audioState])

  React.useEffect(() => {
    outputAudio()
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Bem vindo ao HopeIA
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
        Estamos extremamente felizes em recebê-lo(a) em nossa plataforma dedicada à saúde.
        </p>
        <p className="leading-normal text-muted-foreground">
        Na HopeIA, acreditamos que cada passo em direção ao bem-estar é uma jornada única e valiosa. Nossa inteligência artificial foi criada com o propósito de apoiar, informar e inspirar você em sua busca por uma vida saudável e equilibrada
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
        <div className="flex items-center justify-center h-12">
        {audioState in [AudioState.CONTINUE, AudioState.PAUSE, AudioState.RESTART] ? (
            <>
              <Button
                className="mr-1"
                variant="outline"
                onClick={() => setAudioState(AudioState.PAUSE)}
              >
                <IconPause />
              </Button>
              <Button
                className="mr-1"
                variant="outline"
                onClick={() => setAudioState(AudioState.CONTINUE)}
              >
                <IconResume />
              </Button>
              <Button
                className="mr-1"
                variant="destructive"
                onClick={() => setAudioState(AudioState.STOP)}
              >
                <IconStop />
              </Button>
            </>
          ) : (
            audioState == AudioState.STOP && <Button
                className="mr-1"
                variant="default"
                onClick={() => setAudioState(AudioState.RESTART)}
              >
                <IconResume />
              </Button>
          )}
        </div>
      </div>
    </div>
  )
}
