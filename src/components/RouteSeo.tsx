import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, routeSeo } from '@/lib/seo';

export default function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => { applySeo(pathname, routeSeo(pathname)); }, [pathname]);
  return null;
}
