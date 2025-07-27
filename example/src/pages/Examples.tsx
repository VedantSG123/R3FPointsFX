import { PageScrollContainer } from '@/components/custom/PageScrollContainer'
import { SEO, seoConfigs } from '@/components/SEO'
import ExamplesPage from '@/mdx/examples.mdx'
import { MDXCustomProvider } from '@/providers/MDXCustomProvider'

export default function Examples() {
  return (
    <PageScrollContainer>
      <SEO {...seoConfigs.examples} />
      <MDXCustomProvider>
        <ExamplesPage />
      </MDXCustomProvider>
      <div className='h-12 w-full'></div>
    </PageScrollContainer>
  )
}
