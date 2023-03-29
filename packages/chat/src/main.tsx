import ReactDOM from 'react-dom/client'
import { ReactRouter } from '@liuli-util/react-router'
import '@picocss/pico'
import 'sweetalert2/dist/sweetalert2.css'
import '@sweetalert2/theme-dark'
import './index.css'
import { router, routes } from './constants/router'
import { configure } from 'mobx'

configure({
  enforceActions: 'never',
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ReactRouter history={router} routes={routes} />,
)
