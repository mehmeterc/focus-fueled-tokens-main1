// Fix for Buffer is not defined error in Solana libraries
import * as buffer from 'buffer';
window.Buffer = buffer.Buffer;
window.global = window as any;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
