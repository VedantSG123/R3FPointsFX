import GSAP from 'gsap'
import ScrollSmoother from 'gsap/ScrollSmoother'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { Leva } from 'leva'
import * as React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AppHeader } from './components/AppHeader'
import { Experience } from './experience'
import Docs from './pages/Docs.mdx'
import { Home } from './pages/Home'

GSAP.registerPlugin(ScrollSmoother, ScrollTrigger)

function App() {
  React.useLayoutEffect(() => {
    const smoother = ScrollSmoother.create({
      smooth: 2,
      effects: true,
      smoothTouch: 0.1,
    })

    return () => {
      smoother.kill()
    }
  }, [])

  return (
    <>
      <BrowserRouter>
        <AppHeader />
        <div id='smooth-wrapper'>
          <div id='smooth-content'>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/docs' element={<Docs />} />
            </Routes>
          </div>
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
