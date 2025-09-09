/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './App'

// Initialize theme from localStorage or system preference
(() => {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-kb-theme', isDark ? 'dark' : 'light');
  } catch {}
})();

const root = document.getElementById('root')

render(() => <App />, root!)
