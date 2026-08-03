import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

const markdownSchema = {
  ...defaultSchema,
  tagNames: (defaultSchema.tagNames ?? []).filter((tag) => tag !== 'img'),
  protocols: {
    ...defaultSchema.protocols,
    href: ['http', 'https'],
  },
}

function isSafeHttpUrl(href: string | undefined): boolean {
  if (!href) return false
  const trimmed = href.trim().toLowerCase()
  return trimmed.startsWith('https:') || trimmed.startsWith('http:')
}

const components: Components = {
  img: () => null,
  a: ({ href, children }) => {
    if (isSafeHttpUrl(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      )
    }
    return <span>{children}</span>
  },
}

interface MarkdownSafeProps {
  children: string
  className?: string
}

/** Renders campaign note Markdown safely (no images; http(s) links only). */
export function MarkdownSafe({ children, className }: MarkdownSafeProps) {
  return (
    <div className={className}>
      <ReactMarkdown rehypePlugins={[[rehypeSanitize, markdownSchema]]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
