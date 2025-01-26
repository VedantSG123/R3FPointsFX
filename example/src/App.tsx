import { Leva } from 'leva'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AppHeader } from './components/AppHeader'
import { Experience } from './experience'
import { Home } from './pages/Home'

function App() {
  return (
    <>
      <BrowserRouter>
        <div className='w-full fixed top-1 px-2 max-w-[1200px] left-1/2 -translate-x-1/2 z-40'>
          <AppHeader />
        </div>
        <div>
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
        </div>
        <div className='w-full h-full fixed top-0 left-0 -z-10'>
          <Experience />
        </div>
        <Leva />
      </BrowserRouter>
    </>
  )
}

export default App
