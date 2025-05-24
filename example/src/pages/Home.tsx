import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ChevronRight } from 'lucide-react'
import * as React from 'react'

import { ScrollBottomAnimation } from '@/components/custom/ScrollButtonAnimation'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/ui/markdown-renderer'

import { Subscene } from '../experience/SubScene'

gsap.registerPlugin(ScrollTrigger)

export const Home = () => {
  return (
    <div className='w-full max-w-7xl mx-auto px-2'>
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  )
}

const Section1 = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const scrollAnimationRef = React.useRef<SVGSVGElement>(null)

  React.useEffect(() => {
    if (!scrollAnimationRef.current || !sectionRef.current) return

    const section = sectionRef.current
    const scrollAnimation = scrollAnimationRef.current

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'bottom bottom',
        end: '+=400',
        toggleActions: 'play none none reverse',
        scrub: true,
      },
    })

    tl.to(scrollAnimation, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className='pt-24 md:pt-24 min-h-screen relative'>
      <div>
        <div className='mb-10 md:text-center px-3 flex flex-col items-center gap-4'>
          <h1 className='text-4xl md:text-5xl leading-tight max-w-[800px] font-bold inline-block'>
            Particle Magic Unleashed with{' '}
            <span className='bg-gradient-to-r from-[#00ff00] to-[#0000ff] text-transparent bg-clip-text'>
              PointsFX
            </span>
          </h1>
          <div className='w-full sm:max-w-[280px]'>
            <CodeBlock language='shell'>{`npm install r3f-points-fx`}</CodeBlock>
          </div>
        </div>
        <Subscene />
      </div>
      <ScrollBottomAnimation
        ref={scrollAnimationRef}
        width={30}
        height={36}
        className='absolute bottom-32 left-1/2 -translate-x-1/2 z-10'
      />
    </section>
  )
}

const Section2 = () => {
  return (
    <section
      id='home-section-2'
      className='pt-20 md:pt-24 h-[400px] relative min-h-screen'
    >
      <div>
        <div className='md:text-center'>
          <h1 className='text-2xl md:text-3xl leading-tight font-medium max-w-[800px] w-full mx-auto'>
            Create high-performance, mesh-based particle systems with seamless{' '}
            <span className='bg-gradient-to-r from-[#00ff00] to-[#0000ff] text-transparent bg-clip-text'>
              morphing transitions
            </span>{' '}
            in <b> React three fiber.</b>
          </h1>
        </div>
        <div className='bg-background/10 backdrop-blur max-w-[800px] w-full mx-auto p-4 rounded-lg absolute left-1/2 -translate-x-1/2 bottom-10 md:bottom-20 text-lg'>
          <strong>Built for React Three Fiber</strong>
          <p>
            Integrate seamlessly into any R3F project. Just pass an array of
            meshes, PointsFX handles the morphing and rendering for you. Control
            transitions smoothly using the{' '}
            <code className='bg-background text-sm px-1 py-0.5 font-mono text-red-500 rounded-md'>
              ref
            </code>{' '}
            to update progress and switch between shapes.
          </p>
          <div className='flex justify-center gap-2'>
            <Button className='mt-4 mb-2'>
              Get Started <ChevronRight />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const Section3 = () => {
  return (
    <section id='home-section-3' className='relative min-h-screen'>
      Section 3
    </section>
  )
}
