import { PageScrollContainer } from '@/components/custom/PageScrollContainer'
import ExamplesPage from '@/mdx/examples.mdx'
import { MDXCustomProvider } from '@/providers/MDXCustomProvider'

export default function Examples() {
  return (
    <PageScrollContainer>
      <MDXCustomProvider>
        <ExamplesPage />
      </MDXCustomProvider>
      <div className='h-12 w-full'></div>
    </PageScrollContainer>
  )
}
