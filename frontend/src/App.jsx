import AllRoutes from './components/AllRoutes'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Navbar />
      <AllRoutes />
    </>
  )
}

export default App
