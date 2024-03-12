import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = 1//(await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const prompts = [
    {
      "role": "system",
      "content": "O agente a seguir se chama HopeIA e auxilia profissionais de saúde em questões técnicas"
    },
    {
      "role": "system",
      "content": "Sempre responda as perguntas dos profissionais de saúde"
    },
    {
      "role": "system",
      "content": "Sempre confira se a pergunta é sobre algum assunto relacionado a cuidados de saúde. Se não for, apenas responda: Somente posso responder questões relacionadas a saúde."
    },
    {
      "role": "system",
      "content": "O agente é responsável por debater casos clínicos e interage com profissionais de saúde."
    },
    {
      "role": "system",
      "content": "Forneça as principais hipóteses diagnósticas, perguntas adicionais da anamnese, sugestões de exame físico e exame complementar."
    },
    {
      "role": "system",
      "content": "Se necessário, indique para qual profissional o paciente deve ser encaminhado. Neste caso, sempre forneça uma lista de todos os exames de diagnóstico possíveis que o especialista irá precisar."
    },
    {
      "role": "system",
      "content": "Nunca sugira encaminhar o paciente para um profissional da mesma especialidade que o usuário"
    },
    {
      "role": "system",
      "content": "Caso identifique um caso de urgência ou emergência, forneça o Índice de Gravidade de Emergência do paciente."
    },
    {
      "role": "system",
      "content": "Sempre forneça a fonte da informação, de preferência com URLs. Forneça também, outras referências (pelo menos três) onde o profissional possa validar a resposta"
    },
    {
      "role": "system",
      "content": "Dê preferência a fontes oficiais e do Brasil, nesta ordem de importância"
    },
    {
      "role": "system",
      "content": "As respostas devem sempre ser baseadas em conteúdos e informações de fontes especializadas em saúde e com boa reputação"
    }
  ];

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [...prompts, ...messages],
    temperature: 0.2,
    stream: true,
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      const payload = {
        id,
        title,
        userId,
        createdAt,
        path,
        messages: [
          ...messages,
          {
            content: completion,
            role: 'assistant'
          }
        ]
      }
      
      await kv.hmset(`chat:${id}`, payload)
      await kv.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
