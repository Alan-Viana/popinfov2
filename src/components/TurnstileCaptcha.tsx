import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string
        callback?: (token: string) => void
        'error-callback'?: () => void
        'expired-callback'?: () => void
        theme?: 'light' | 'dark' | 'auto'
        size?: 'normal' | 'compact' | 'invisible'
      }) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

type TurnstileCaptchaProps = {
  siteKey: string
  onTokenChange: (token: string | null) => void
  theme?: 'light' | 'dark' | 'auto'
}

const scriptId = 'turnstile-script'
const scriptSrc = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

const ensureScript = () => {
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null

  if (existing) {
    return existing
  }

  const script = document.createElement('script')
  script.id = scriptId
  script.src = scriptSrc
  script.async = true
  script.defer = true
  document.head.appendChild(script)

  return script
}

const TurnstileCaptcha = ({ siteKey, onTokenChange, theme = 'auto' }: TurnstileCaptchaProps) => {
  const containerId = useId()
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey) {
      onTokenChange(null)
      return
    }

    const renderWidget = () => {
      if (!window.turnstile) {
        return
      }

      const container = document.getElementById(containerId)
      if (!container) {
        return
      }

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore stale widget cleanup errors
        }
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        theme,
        callback: (token) => onTokenChange(token),
        'error-callback': () => onTokenChange(null),
        'expired-callback': () => onTokenChange(null),
      })
    }

    const script = ensureScript()

    const onLoad = () => renderWidget()

    if (window.turnstile) {
      renderWidget()
    } else {
      script.addEventListener('load', onLoad, { once: true })
    }

    return () => {
      script.removeEventListener('load', onLoad)
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          // ignore cleanup errors on unmount
        }
      }
      widgetIdRef.current = null
    }
  }, [containerId, onTokenChange, siteKey, theme])

  return <div id={containerId} />
}

export default TurnstileCaptcha
