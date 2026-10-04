import { beforeEach, describe, expect, it } from 'vitest';
import { applySeo, canonicalUrl, publicPages, routeSeo, structuredData } from '@/lib/seo';

describe('search metadata', () => {
  beforeEach(() => { document.head.innerHTML = ''; });
  it('distinguishes public, product, private and unknown routes', () => {
    expect(routeSeo('/catalog/')).toEqual(publicPages['/catalog']);
    expect(routeSeo('/product/kitob').noindex).toBeUndefined();
    for (const route of ['/admin', '/account/orders', '/seller', '/cart', '/auth', '/missing']) {
      expect(routeSeo(route).noindex).toBe(true);
    }
    expect(canonicalUrl('/catalog/')).toBe('https://dtpi.store/catalog');
  });
  it('updates one canonical and removes homepage schema on navigation', () => {
    applySeo('/', routeSeo('/'));
    expect(JSON.parse(document.getElementById('site-structured-data')!.textContent!)).toMatchObject({ '@type': 'WebSite', name: 'DTPI Market' });
    applySeo('/catalog', routeSeo('/catalog'));
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://dtpi.store/catalog');
    expect(document.title).toBe(publicPages['/catalog'].title);
    expect(document.getElementById('site-structured-data')).toBeNull();
    applySeo('/cart', routeSeo('/cart'));
    expect(document.head.querySelector('meta[name="robots"]')!.getAttribute('content')).toBe('noindex, follow');
    applySeo('/', routeSeo('/'));
    expect(document.getElementById('site-structured-data')).not.toBeNull();
    expect(document.head.querySelector('meta[name="robots"]')!.getAttribute('content')).toContain('index, follow');
    expect(structuredData('/catalog')).toBeNull();
  });
});
