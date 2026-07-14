/* @refresh reload */
import { render } from 'solid-js/web'
import { initAnalytics, initColorMode } from '@regenfass/brand'
import * as maplibre from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import { Protocol } from 'pmtiles'

import './index.css'
import App from './App'

maplibre.setWorkerUrl(workerUrl)
maplibre.addProtocol('pmtiles', new Protocol({ metadata: true }).tile)

initColorMode();

initAnalytics(import.meta.env.VITE_SWETRIX_PROJECT_ID, {
  apiURL: import.meta.env.VITE_SWETRIX_API_URL,
});

const root = document.getElementById('root')

render(() => <App />, root!)
