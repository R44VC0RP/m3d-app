'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ConvAIWidget() {
  const pathname = usePathname();
  const scriptLoadedRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Don't render on admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute || scriptLoadedRef.current) return;

    // Load the script dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    script.onload = () => {
      scriptLoadedRef.current = true;
      
      // Create the custom element after script loads
      if (widgetRef.current) {
        const convaiElement = document.createElement('elevenlabs-convai');
        convaiElement.setAttribute('agent-id', 'sYPgpTjQ17Lcs96YCl4B');
        widgetRef.current.appendChild(convaiElement);
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
        scriptLoadedRef.current = false;
      }
    };
  }, [isAdminRoute]);

  // Don't render anything on admin routes
  if (isAdminRoute) {
    return null;
  }

  return <div ref={widgetRef}></div>;
}
