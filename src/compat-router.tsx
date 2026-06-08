'use client';

import React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation';

export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, href, ...props }, ref) => {
  return <NextLink href={to || href || '/'} {...props} ref={ref} />;
});
Link.displayName = 'Link';

export const useLocation = () => {
  const pathname = usePathname();
  return { pathname };
};

export const useNavigate = () => {
  const router = useRouter();
  return (path: string | number) => {
    if (typeof path === 'number') {
      if (path === -1) {
        window.history.back();
      } else if (path === 1) {
        window.history.forward();
      }
    } else {
      router.push(path);
    }
  };
};

export const useSearchParams = () => {
  const nextSearchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname || '/';

  const setSearchParams = (newParams: Record<string, string> | URLSearchParams) => {
    const params = new URLSearchParams(nextSearchParams?.toString() || '');
    if (newParams instanceof URLSearchParams) {
      newParams.forEach((value, key) => {
        params.set(key, value);
      });
    } else {
      // It's a Record. If empty, wipe the query.
      if (Object.keys(newParams).length === 0) {
        router.push(currentPath);
        return;
      }
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
    }
    const queryStr = params.toString();
    router.push(`${currentPath}${queryStr ? '?' + queryStr : ''}`);
  };

  return [nextSearchParams, setSearchParams] as const;
};
