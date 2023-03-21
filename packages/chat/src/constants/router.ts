import { createHashHistory, RouteConfig } from '@liuli-util/react-router'
import { ChatHomeView } from '../views/chat/ChatView'
import {
  SettingHomeView,
  SettingOpenAPIKeyView,
  SettingPromptEditView,
  SettingPromptView,
  SettingLayoutView,
} from '../views/setting/SettingView'
import { SpeakView } from '../views/speak/SpeakView'
import { AzureSpeechToText } from '../views/test/AzureSpeechToText'
import { AzureTextToSpeech } from '../views/test/AzureTextToSpeech'
import { CompleteInputDemo } from '../views/test/CompleteInputDemo'

export const settingRoutes: (RouteConfig & { title: string })[] = [
  { path: '/setting', component: SettingHomeView, title: 'Setting' },
  { path: '/setting/open-api-key', component: SettingOpenAPIKeyView, title: 'Open API Key' },
  { path: '/setting/prompt', component: SettingPromptView, title: 'Prompt' },
  { path: '/setting/prompt/new', component: SettingPromptEditView, title: 'Prompt' },
  { path: '/setting/prompt/:promptId', component: SettingPromptEditView, title: 'Prompt Edit' },
]

export const routes: RouteConfig[] = [
  { path: '/speak', component: SpeakView },
  {
    path: '/setting',
    component: SettingLayoutView,
    children: settingRoutes,
  },
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
