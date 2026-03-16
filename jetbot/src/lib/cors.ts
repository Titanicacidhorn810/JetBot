export function resolveProxyUrl(targetUrl: string, proxyBaseUrl?: string): string {
  if (!proxyBaseUrl) return targetUrl;
  const base = proxyBaseUrl.replace(/\/$/, '');
  return `${base}/proxy?url=${encodeURIComponent(targetUrl)}`;
}
