import React from 'react'

type Props = {
  title?: string
  faviconHref?: string
}

export default function DocumentHead({ title, faviconHref }: Props) {
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    if (title) {
      document.title = title
    }
    if (faviconHref) {
      const href = `${faviconHref}${faviconHref.includes('?') ? '' : '?v=' + Date.now()}`
      const ensureLink = (rel: string) => {
        let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`)
        if (!link) {
          link = document.createElement('link')
          link.rel = rel
          document.head.appendChild(link)
        }
        link.type = 'image/svg+xml'
        link.href = href
      }
      ensureLink('icon')
      ensureLink('shortcut icon')
    }
  }, [title, faviconHref])
  return null
}
