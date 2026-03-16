import type { Tool } from '../../types/tool';
import { resolveProxyUrl } from '../../lib/cors';

export function createHttpGet(proxyUrl?: string): Tool {
  return {
    definition: {
      type: 'function',
      function: {
        name: 'http_get',
        description: 'Fetch a URL and return its content. Extracts readable text from HTML pages.',
        parameters: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to fetch' },
          },
          required: ['url'],
        },
      },
    },
    permission: 'risky',
    async execute(params) {
      const url = resolveProxyUrl(params.url as string, proxyUrl);
      const response = await fetch(url, {
        headers: { 'Accept': 'text/html, application/json, text/plain' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      let text = await response.text();

      // Try to extract readable content from HTML
      if (contentType.includes('html')) {
        text = extractReadableText(text);
      }

      if (text.length > 10240) {
        text = text.slice(0, 10240) + '\n... [truncated]';
      }
      return text;
    },
  };
}

function extractReadableText(html: string): string {
  // Simple extraction: remove scripts, styles, tags
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}
