import { useEffect } from 'react'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  canonicalUrl?: string
  structuredData?: object
}

const defaultSEO = {
  title: 'R3FPointsFX - High Performance React Three Fiber Particle System',
  description:
    'Create stunning 3D particle effects with R3FPointsFX. A React Three Fiber component for high-performance particle meshes with seamless morphing capabilities. Perfect for interactive 3D experiences.',
  keywords:
    'react three fiber, threejs particles, 3d particles, webgl particles, react 3d, three.js components, particle morphing, interactive particles, r3f components, 3d visualization',
  ogImage: 'https://pointsfx.vercel.app/og-image.png',
  canonicalUrl: 'https://pointsfx.vercel.app/',
}

export const SEO: React.FC<SEOProps> = ({
  title = defaultSEO.title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  ogImage = defaultSEO.ogImage,
  canonicalUrl = defaultSEO.canonicalUrl,
  structuredData,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title

    // Update meta tags
    updateMetaTag('name', 'description', description)
    updateMetaTag('name', 'keywords', keywords)
    updateMetaTag('property', 'og:title', title)
    updateMetaTag('property', 'og:description', description)
    updateMetaTag('property', 'og:image', ogImage)
    updateMetaTag('property', 'og:url', canonicalUrl)
    updateMetaTag('property', 'twitter:title', title)
    updateMetaTag('property', 'twitter:description', description)
    updateMetaTag('property', 'twitter:image', ogImage)

    // Update canonical URL
    updateCanonicalUrl(canonicalUrl)

    // Update structured data
    if (structuredData) {
      updateStructuredData(structuredData)
    }
  }, [title, description, keywords, ogImage, canonicalUrl, structuredData])

  return null
}

function updateMetaTag(attribute: string, name: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function updateCanonicalUrl(url: string) {
  let element = document.querySelector('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  element.setAttribute('href', url)
}

function updateStructuredData(data: object) {
  // Remove existing structured data
  const existingScript = document.querySelector(
    'script[type="application/ld+json"]#dynamic-structured-data',
  )
  if (existingScript) {
    existingScript.remove()
  }

  // Add new structured data
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.id = 'dynamic-structured-data'
  script.textContent = JSON.stringify(data)
  document.head.appendChild(script)
}

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: 'R3FPointsFX - High Performance React Three Fiber Particle System',
    description:
      'Create stunning 3D particle effects with R3FPointsFX. A React Three Fiber component for high-performance particle meshes with seamless morphing capabilities.',
    canonicalUrl: 'https://pointsfx.vercel.app/',
  },
  docs: {
    title: 'Documentation - R3FPointsFX | React Three Fiber Particles',
    description:
      'Complete documentation for R3FPointsFX. Learn how to create high-performance 3D particle effects with React Three Fiber. API reference, examples, and best practices.',
    canonicalUrl: 'https://pointsfx.vercel.app/docs',
  },
  examples: {
    title: 'Examples - R3FPointsFX | Interactive 3D Particle Demos',
    description:
      'Explore interactive examples of R3FPointsFX in action. See particle morphing, color mixing, vertex modifiers, and more. Copy code and experiment with live demos.',
    canonicalUrl: 'https://pointsfx.vercel.app/examples',
  },
} as const
