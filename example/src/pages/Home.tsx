import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { ChevronRight } from 'lucide-react'
import { Cpu, Gpu, Link, Zap } from 'lucide-react'
import * as React from 'react'
import { Link as RouterLink } from 'react-router'

import { CodeBlock } from '@/components/custom/markdown/markdown-renderer'
import { ScrollBottomAnimation } from '@/components/custom/ScrollButtonAnimation'
import { SEO, seoConfigs } from '@/components/SEO'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useCustomEventDispatch } from '@/hooks/useCustomEvents'
import { cn } from '@/lib/utils'
import type { ArrangeMode } from '@/types'

import { Subscene } from '../experience/SubScene'

gsap.registerPlugin(ScrollTrigger)

export const Home = () => {
  return (
    <div className='w-full'>
      <SEO {...seoConfigs.home} />
      <Section1 />
      <Section2 />
      <Section3 />
      <div className='w-full h-screen bg-gradient-to-t from-transparent via-black/50 to-black/80'></div>
      <Section4 />
      <Section5 />
      <Section6 />
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
    <section
      ref={sectionRef}
      className='pt-24 md:pt-24 min-h-screen relative px-2'
    >
      <div>
        <div className='mb-10 md:text-center px-3 flex flex-col items-center gap-4'>
          <h1 className='text-4xl md:text-5xl leading-relaxed max-w-[800px] font-bold inline-block'>
            Particle Magic Unleashed with <GradientText>PointsFX</GradientText>
          </h1>
          <div className='w-full sm:max-w-[280px] my-4'>
            <CodeBlock language='shell'>{`npm install r3f-points-fx`}</CodeBlock>
          </div>
        </div>
        <Subscene />
      </div>
      <ScrollBottomAnimation
        ref={scrollAnimationRef}
        width={30}
        height={36}
        className='absolute -bottom-12 left-1/2 -translate-x-1/2 z-10'
      />
      <div className='absolute -z-[5] inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 pointer-events-none' />
    </section>
  )
}

const Section2 = () => {
  return (
    <section id='home-section-2' className='relative min-h-screen'>
      <div>
        <div className='w-full'>
          <div className='max-w-6xl w-full mx-auto p-8'>
            <h1 className='text-4xl md:text-5xl font-bold mt-28'>
              Create high-performance, mesh-based particle systems with seamless{' '}
              <GradientText>morphing transitions</GradientText> in{' '}
              <b>React three fiber.</b>
            </h1>
          </div>
        </div>
        <div className='bg-background/10 backdrop-blur max-w-5xl w-full mx-auto p-4 rounded-lg absolute left-1/2 -translate-x-1/2 bottom-10 md:bottom-20 text-xl'>
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
            <RouterLink to='/docs#getting-started'>
              <Button className='mt-4 mb-2'>
                Get Started <ChevronRight />
              </Button>
            </RouterLink>
          </div>
        </div>
      </div>
      <div className='absolute -z-[5] inset-0 bg-gradient-to-t from-transparent via-black/50 to-black/80 pointer-events-none' />
    </section>
  )
}

const Section3 = () => {
  return (
    <section id='home-section-3' className='min-h-screen relative'>
      <div className='w-full max-w-7xl mx-auto min-h-screen relative'>
        <div className='mx-auto z-10 max-w-6xl px-4 md:px-8 absolute top-1/2 -translate-y-1/2'>
          <div>
            <div className='space-y-6'>
              <h2 className='text-4xl md:text-5xl font-bold'>
                <GradientText>High Performance, Zero Compromises</GradientText>
              </h2>
              <p className='text-lg text-gray-300 max-w-xl'>
                Experience buttery smooth animations with our optimized
                rendering engine that handles thousands of particles at 60fps.
              </p>
              <div className='space-y-4 mt-8'>
                <div className='flex items-center space-x-4'>
                  <div className=''>
                    <div className='w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center'>
                      <Zap className='text-blue-400' />
                    </div>
                  </div>
                  <div>
                    <h3 className='font-semibold text-xl text-white'>
                      Lightning Fast
                    </h3>
                    <p className='text-gray-400'>
                      Optimized WebGL shaders for maximum performance
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className=''>
                    <div className='w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center'>
                      <Gpu className='text-purple-400' />
                    </div>
                  </div>
                  <div>
                    <h3 className='font-semibold text-xl text-white'>
                      GPU Accelerated
                    </h3>
                    <p className='text-gray-400'>
                      Harness the full power of your graphics card
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className=''>
                    <div className='w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center'>
                      <Cpu className='text-indigo-400' />
                    </div>
                  </div>
                  <div>
                    <h3 className='font-semibold text-xl text-white'>
                      Massive Scale
                    </h3>
                    <p className='text-gray-400'>
                      Handles thousands of particles while maintaining excellent
                      performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/80 pointer-events-none' />
    </section>
  )
}

const Section4 = () => {
  const pinRef = React.useRef<HTMLDivElement>(null)
  const sectionRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!sectionRef || !pinRef) return

    const section = sectionRef.current
    const pinContent = pinRef.current

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: 1,
        pin: pinContent,
      },
    })
    return () => {
      tl.kill()
    }
  }, [])

  return (
    <>
      <div id='buffer-1' className='w-full min-h-screen relative'>
        <div ref={pinRef} className='w-full'>
          <div className='max-w-7xl mx-auto md:text-center pt-32 px-4 md:px-8'>
            <h1 className='text-4xl md:text-5xl font-bold'>
              Highly <GradientText>Customizable</GradientText>, Endless{' '}
              <GradientText>Possibilities</GradientText>
            </h1>
          </div>
        </div>
      </div>
      <section
        ref={sectionRef}
        id='home-section-4'
        className='relative w-full min-h-screen'
      >
        <div className='w-full absolute bottom-12'>
          <div className='max-w-5xl mx-auto px-4 md:px-8'>
            <div className='text-xl p-4 rounded-lg bg-background/10 backdrop-blur'>
              Unleash your creativity with powerful GLSL modifiers. PointsFX
              allows you to inject custom shader code to control every aspect of
              your particle system. From particle behavior and color to
              transition dynamics, you have the ultimate control. During
              morphing you can even morph between particle shape, color and
              movement behaviours using the{' '}
              <RouterLink
                to='/docs#using-the-modifier-functions'
                className='font-bold'
              >
                <GradientText className='underline'>
                  modifier functions{' '}
                  <Link className='inline-block w-3 h-3 relative bottom-1 text-purple-600' />
                </GradientText>
              </RouterLink>
              .
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const Section5 = () => {
  const [selectedMode, setSelectedMode] = React.useState<ArrangeMode>('vertex')
  const dispatch = useCustomEventDispatch<ArrangeMode>('mode-change')

  const handleModeChange = (mode: ArrangeMode) => {
    setSelectedMode(mode)
    dispatch(mode)
  }

  return (
    <>
      <div id='buffer-2' className='w-full min-h-screen relative'></div>
      <div id='buffer-3' className='w-full min-h-screen relative'></div>
      <section id='home-section-5' className='relative w-full min-h-screen'>
        <div className='w-full max-w-7xl mx-auto px-4 md:px-8 pt-32'>
          <div className='text-center mb-16'>
            <h1 className='text-4xl md:text-5xl font-bold mb-6'>
              Two Powerful <GradientText>Arrangement Modes</GradientText>
            </h1>
          </div>
        </div>
        <div className='w-full absolute bottom-36'>
          <div className='max-w-7xl mx-auto px-4 md:px-8'>
            {/* Mobile Accordion View */}
            <div className='md:hidden'>
              <Accordion type='single' collapsible className='space-y-0'>
                <AccordionItem
                  value='vertex'
                  className={`bg-background/10 backdrop-blur rounded-lg border-2 ${
                    selectedMode === 'vertex'
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-transparent'
                  }`}
                >
                  <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={selectedMode === 'vertex'}
                        onCheckedChange={() => handleModeChange('vertex')}
                        className='w-4 h-4'
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className='text-xl font-semibold'>
                        Vertex Based Mode
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-6 pb-6'>
                    <div className='space-y-3 text-gray-300'>
                      <p>
                        Perfect for scenarios where you need precise control
                        over particle positioning and smooth morphing between
                        different mesh shapes.
                      </p>
                      <ul className='text-sm space-y-1 list-disc list-inside'>
                        <li>Particles match vertex positions exactly</li>
                        <li>
                          Particles count{' '}
                          <span className='font-bold'>
                            cannot be greater than the vertex count
                          </span>{' '}
                          in the geometry
                        </li>
                        <li>Ideal for geometric morphing</li>
                        <li>Predictable particle behavior</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value='random'
                  className={`bg-background/10 backdrop-blur rounded-lg border-2 ${
                    selectedMode === 'random'
                      ? 'border-purple-500/50 bg-purple-500/5'
                      : 'border-transparent'
                  }`}
                >
                  <AccordionTrigger className='px-6 py-4 text-left hover:no-underline'>
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        checked={selectedMode === 'random'}
                        onCheckedChange={() => handleModeChange('random')}
                        className='w-4 h-4'
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className='text-xl font-semibold'>
                        Random Surface Mode
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='px-6 pb-6'>
                    <div className='space-y-3 text-gray-300'>
                      <p>
                        Great for creating organic, natural-looking particle
                        effects with unlimited particle counts and creative
                        freedom.
                      </p>
                      <ul className='text-sm space-y-1 list-disc list-inside'>
                        <li>Random distribution on mesh surface</li>
                        <li>
                          Particles are{' '}
                          <span className='font-bold'>not limited</span> by mesh
                          vertex count
                        </li>
                        <li>Perfect for organic effects</li>
                        <li>Creative particle placement</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Desktop Grid View */}
            <div className='hidden md:grid md:grid-cols-2 gap-8'>
              <div
                className={`bg-background/10 backdrop-blur rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 border-2 ${
                  selectedMode === 'vertex'
                    ? 'border-blue-500/50 bg-blue-500/5'
                    : 'border-transparent hover:border-blue-500/30'
                }`}
                onClick={() => handleModeChange('vertex')}
              >
                <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  <Checkbox
                    checked={selectedMode === 'vertex'}
                    onCheckedChange={() => handleModeChange('vertex')}
                    className='w-4 h-4'
                  />
                  Vertex Based Mode
                </h3>
                <div className='space-y-3 text-gray-300'>
                  <p>
                    Perfect for scenarios where you need precise control over
                    particle positioning and smooth morphing between different
                    mesh shapes.
                  </p>

                  <ul className='text-sm space-y-1 list-disc list-inside'>
                    <li>Particles match vertex positions exactly</li>
                    <li>
                      Particles count{' '}
                      <span className='font-bold'>
                        cannot be greater than the vertex count
                      </span>{' '}
                      in the geometry
                    </li>
                    <li>Ideal for geometric morphing</li>
                    <li>Predictable particle behavior</li>
                  </ul>
                </div>
              </div>

              <div
                className={`bg-background/10 backdrop-blur rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 border-2 ${
                  selectedMode === 'random'
                    ? 'border-purple-500/50 bg-purple-500/5'
                    : 'border-transparent hover:border-purple-500/30'
                }`}
                onClick={() => handleModeChange('random')}
              >
                <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
                  <Checkbox
                    checked={selectedMode === 'random'}
                    onCheckedChange={() => handleModeChange('random')}
                    className='w-4 h-4'
                  />
                  Random Surface Mode
                </h3>
                <div className='space-y-3 text-gray-300'>
                  <p>
                    Great for creating organic, natural-looking particle effects
                    with unlimited particle counts and creative freedom.
                  </p>

                  <ul className='text-sm space-y-1 list-disc list-inside'>
                    <li>Random distribution on mesh surface</li>
                    <li>
                      Particles are{' '}
                      <span className='font-bold'>not limited</span> by mesh
                      vertex count
                    </li>
                    <li>Perfect for organic effects</li>
                    <li>Creative particle placement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const Section6 = () => {
  return (
    <section className='w-full'>
      <div className='w-full max-w-7xl mx-auto px-4 md:px-8'>
        {/* Call to Action */}
        <div className='text-center mt-16'>
          <div className='bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-2xl p-8 border border-blue-500/20'>
            <h3 className='text-2xl font-bold mb-4'>
              Ready to <GradientText>Transform</GradientText> Your Projects?
            </h3>
            <p className='text-gray-300 mb-6 max-w-2xl mx-auto'>
              Start building stunning particle effects with PointsFX. Choose
              your arrangement mode, customize your particles, and create
              mesmerizing visual experiences.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <RouterLink to='/examples'>
                <Button
                  size='lg'
                  className='bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                >
                  Explore Examples
                </Button>
              </RouterLink>
              <RouterLink to='/docs'>
                <Button size='lg' variant='outline'>
                  View Documentation
                </Button>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const GradientText = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const hasUnderline = className?.includes('underline')

  return (
    <span
      className={cn(
        'bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text',
        hasUnderline &&
          'relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-blue-400 after:to-purple-600',
        className,
      )}
    >
      {children}
    </span>
  )
}
