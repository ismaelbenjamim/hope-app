import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

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
      </div>
    </div>
  )
}
