from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_openai import ChatOpenAI
import speech_recognition as sr
from gtts import gTTS
import pyttsx3
import sounddevice




def initialize_sophia(speciality):

    prompt = ChatPromptTemplate.from_messages([
        ("system", "O agente a seguir se chama Sophia e auxilia profissionais de saúde em questões técnicas"),
        ("system", "Sempre responda as perguntas dos profissionais de saúde"),
        ("system", "Sempre confira se a pergunta é sobre algum assunto relacionado a cuidados de saúde. Se não for, apenas responda: Somente posso responder questões relacionadas a saúde."),
        ("system", "O agente é responsável por debater casos clínicos e interage com profissionais de saúde."),
        ("user", f"Olá sou um profissional de saúde da seguinte especialidade: {speciality}."),
        ("system", "Forneça as principais hipóteses diagnósticas, perguntas adicionais da anamnese, sugestões de exame físico e exame complementar."),
        ("system", "Se necessário, indique para qual profissional o paciente deve ser encaminhado. Neste caso, sempre forneça uma lista de todos os exames de diagnóstico possíveis que o especialista irá precisar."),
        ("system", "Nunca sugira encaminhar o paciente para um profissional da mesma especialidade que o usuário"),
        ("system", "Caso identifique um caso de urgência ou emergência, forneça o Índice de Gravidade de Emergência do paciente."),
        ("system", "Sempre forneça a fonte da informação, de preferência com URLs. Forneça também, outras referências (pelo menos três) onde o profissional possa validar a resposta"),
        ("system", "Dê preferência a fontes oficiais e do Brasil, nesta ordem de importância"),
        ("system", "As respostas devem sempre ser baseadas em conteúdos e informações de fontes especializadas em saúde e com boa reputação"),
        MessagesPlaceholder(variable_name="messages"),
    ])
    return prompt


def get_sophia_response(chat_history, user_speciality=None):
    if user_speciality is None:
        user_speciality = 'Generalista'
    prompt = initialize_sophia(user_speciality)

    chat = ChatOpenAI(api_key="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", model="gpt-4", temperature=0.2)

    chain = prompt | chat
    response = chain.invoke({"messages": chat_history.messages})

    return response


def obter_input():
    print("Digite ou pressione ENTER para falar:")
    texto = input()
    if texto:
        return texto.lower()

    r = sr.Recognizer()
    with sr.Microphone() as source:
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)

    try:
        texto = r.recognize_google(audio, language='pt-BR')
        print(texto)
        return texto.lower()
    except sr.UnknownValueError:
        falar("Não foi possível entender a fala")
        print("Não foi possível entender a fala")
    except sr.RequestError as e:
        falar("Erro ao se comunicar com o serviço de reconhecimento de fala")
        print("Erro ao se comunicar com o serviço de reconhecimento de fala:", e)

    return ""


def responder_com_sophia(pergunta, chat_history):
    chat_history.add_user_message(pergunta)

    response = get_sophia_response(chat_history)
    chat_history.add_ai_message(response.content)
    print(chat_history)
    return response.content


def falar(resposta):
    engine = pyttsx3.init(driverName='espeak')
    engine.setProperty('rate', 150)
    engine.setProperty('volume', 1.0)
    engine.setProperty('voice', 'brazil')
    engine.say(resposta)
    engine.runAndWait()

def main():
    chat_hitory = ChatMessageHistory()
    while True:
        texto = obter_input()
        if texto == 'sair':
            break
        resposta = responder_com_sophia(texto, chat_hitory)
        print("Resposta:", resposta)
        falar(resposta)


if __name__ == "__main__":
    main()
