import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import axios from 'axios'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { store } from './store/store.js'

// Global default: every axios call in the app (raw `axios.get(...)` or the
// shared `api` instance) will now include the httpOnly auth cookie. Without
// this, the browser won't send cookies cross-origin (frontend :5173,
// backend :5000) even though the backend now sets/reads one.
axios.defaults.withCredentials = true

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)