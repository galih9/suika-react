import { createRoot } from 'react-dom/client'
import 'tailwindcss/tailwind.css'
import App from 'components/App'
import MatterPixiSmoke from 'components/smoketest'

const container = document.getElementById('root') as HTMLDivElement
const root = createRoot(container)

root.render(<App />)
