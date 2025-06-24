import { Leva } from 'leva'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AppHeader } from './components/AppHeader'
import { Experience } from './experience'
import { Home } from './pages/Home'

function App() {
  return (
    <>
      <BrowserRouter>
        <AppHeader />
        <div>
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
        </div>
        <div className='w-full h-full fixed top-0 left-0 -z-10 bg-black'>
          <Experience />
        </div>
        <Leva />
      </BrowserRouter>
    </>
  )
}

export default App
