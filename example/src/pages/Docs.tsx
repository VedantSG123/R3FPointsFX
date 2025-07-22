import { PageScrollContainer } from '@/components/custom/PageScrollContainer'
import DocsPage from '@/mdx/docs.mdx'
import { MDXCustomProvider } from '@/providers/MDXCustomProvider'

export default function Docs() {
  return (
    <PageScrollContainer>
      <MDXCustomProvider>
        <DocsPage />
      </MDXCustomProvider>
      <div className='h-12 w-full'></div>
    </PageScrollContainer>
  )
}
