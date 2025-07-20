import { PageScrollContainer } from '@/components/custom/PageScrollContainer'
import DocsPage from '@/mdx/docs.mdx'
import { MDXCustomProvider } from '@/providers/MDXCustomProvider'

export default function Docs() {
  return (
    <PageScrollContainer>
      <MDXCustomProvider>
        <DocsPage />
      </MDXCustomProvider>
    </PageScrollContainer>
  )
}
