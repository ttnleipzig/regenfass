/* @refresh reload */
import { render } from 'solid-js/web'
import { initAnalytics, initColorMode } from '@regenfass/brand'

import './index.css'
import App from './App'

initColorMode();

initAnalytics(import.meta.env.VITE_SWETRIX_PROJECT_ID, {
  apiURL: import.meta.env.VITE_SWETRIX_API_URL,
});

const root = document.getElementById('root')

render(() => <App />, root!)
