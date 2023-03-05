import React from 'react'
import ReactDOM from 'react-dom/client'
import { ReactRouter } from '@liuli-util/react-router'
import '@picocss/pico'
import './index.css'
import { router, routes } from './constants/router'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactRouter history={router} routes={routes} />
  </React.StrictMode>,
)
