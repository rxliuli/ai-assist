import { ReactRouter } from '@liuli-util/react-router'
import './App.css'
import { router, routes } from './constants/router'

function App() {
  return <ReactRouter history={router} routes={routes}></ReactRouter>
}

export default App
