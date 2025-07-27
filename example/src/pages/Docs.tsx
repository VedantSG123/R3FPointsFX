import { PageScrollContainer } from '@/components/custom/PageScrollContainer'
import { SEO, seoConfigs } from '@/components/SEO'
import DocsPage from '@/mdx/docs.mdx'
import { MDXCustomProvider } from '@/providers/MDXCustomProvider'

export default function Docs() {
  return (
    <PageScrollContainer>
      <SEO {...seoConfigs.docs} />
      <MDXCustomProvider>
        <DocsPage />
      </MDXCustomProvider>
      <div className='h-12 w-full'></div>
    </PageScrollContainer>
  )
}
