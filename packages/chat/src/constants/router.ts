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
import { ActiveView } from '../views/user/ActiveView'
import { SignInView } from '../views/user/SignInView'
import { SignUpView } from '../views/user/SignUpView'
import { SyncLocalView } from '../views/setting/SyncLocalView'
import { PasswordResetSendView as PasswordResetSentView, PasswordResetView } from '../views/user/PasswordResetView'

export const routes: RouteConfig[] = [
  { path: '/speak', component: SpeakView },
  {
    path: '/setting',
    component: SettingLayoutView,
    children: [
      { path: '/setting', component: SettingHomeView },
      { path: '/setting/open-api-key', component: SettingOpenAPIKeyView },
      { path: '/setting/prompt', component: SettingPromptView },
      { path: '/setting/prompt/new', component: SettingPromptEditView },
      { path: '/setting/prompt/:promptId', component: SettingPromptEditView },
      { path: '/setting/sync', component: SyncLocalView },
    ],
  },
  { path: '/:sessionId', component: ChatHomeView },
  { path: '/signin', component: SignInView },
  { path: '/reset-password-sent', component: PasswordResetSentView },
  { path: '/reset-password', component: PasswordResetView },
  // { path: '/signup', component: SignUpView },
  { path: '/active', component: ActiveView },
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
