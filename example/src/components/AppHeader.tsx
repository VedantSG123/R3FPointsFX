import { Button } from '@/components/ui/button'

export const AppHeader = () => {
  return (
    <header className='border-grid fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto flex justify-between w-full py-3 px-4 items-center'>
        <div className='flex items-center gap-6'>
          <div className='font-bold text-2xl'>Points FX</div>
          <div className='flex bg-transparent'>
            <Button variant='ghost'>Home</Button>
            <Button variant='ghost'>Examples</Button>
            <Button variant='ghost'>Docs</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
