import { createHashHistory, RouteConfig } from '@liuli-util/react-router'
import { ChatHomeView } from '../views/chat/ChatView'
import { SettingView } from '../views/setting/SettingView'
import { SpeakView } from '../views/speak/SpeakView'
import { AzureSpeechToText } from '../views/test/AzureSpeechToText'
import { AzureTextToSpeech } from '../views/test/AzureTextToSpeech'
import { CompleteInputDemo } from '../views/test/CompleteInputDemo'

export const routes: RouteConfig[] = [
  { path: '/speak', component: SpeakView },
  { path: '/settings', component: SettingView },
  { path: '/:sessionId', component: ChatHomeView },
  { path: '/', component: ChatHomeView },
]

if (import.meta.env.DEV) {
  routes.unshift(
    { path: '/test/azure-speech-to-text', component: AzureSpeechToText },
    { path: '/test/azure-text-to-speech', component: AzureTextToSpeech },
    { path: '/test/complete-input-demo', component: CompleteInputDemo },
  )
}

export const router = createHashHistory()
