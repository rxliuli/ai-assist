import { createBrowserHistory, RouteConfig } from '@liuli-util/react-router'
import { ChatView } from '../views/chat/ChatView'
import { SpeakView } from '../views/speak/SpeakView'

export const routes: RouteConfig[] = [
  { path: '/', component: ChatView },
  { path: '/speak', component: SpeakView },
]

export const router = createBrowserHistory()
