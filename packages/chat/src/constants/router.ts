import { createHashHistory, RouteConfig } from '@liuli-util/react-router'
import { ChatHomeView } from '../views/chat/ChatView'
import { SpeakView } from '../views/speak/SpeakView'
import { AzureSpeechToText } from '../views/test/AzureSpeechToText'
import { AzureTextToSpeech } from '../views/test/AzureTextToSpeech'

export const routes: RouteConfig[] = [
  { path: '/speak', component: SpeakView },
  { path: '/test/azure-speech-to-text', component: AzureSpeechToText },
  { path: '/test/azure-text-to-speech', component: AzureTextToSpeech },
  { path: '/:sessionId', component: ChatHomeView },
  { path: '/', component: ChatHomeView },
]

export const router = createHashHistory()
