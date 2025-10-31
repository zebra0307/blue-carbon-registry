/**
 * Performance optimization utilities
 * Provides memoization, debouncing, and throttling helpers
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';

/**
 * Debounce function - delays execution until after wait time
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 * @param func Function to throttle
 * @param wait Wait time in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
}

/**
 * React hook for debounced values
 * @param value Value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * React hook for throttled callbacks
 * @param callback Function to throttle
 * @param delay Delay in milliseconds
 * @returns Throttled callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
}

/**
 * React hook for previous value
 * @param value Current value
 * @returns Previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * React hook for lazy loading with intersection observer
 * @returns [ref, isIntersecting]
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * Memoize expensive computations
 * @param fn Function to memoize
 * @param deps Dependencies
 * @returns Memoized result
 */
export function useMemoizedValue<T>(fn: () => T, deps: React.DependencyList): T {
  return useMemo(fn, deps);
}

/**
 * Cache data in localStorage with expiration
 */
export class LocalStorageCache {
  private static getKey(key: string): string {
    return `cache_${key}`;
  }

  static set<T>(key: string, value: T, expirationMinutes: number = 60): void {
    const item = {
      value,
      expiry: Date.now() + expirationMinutes * 60 * 1000,
    };
    localStorage.setItem(this.getKey(key), JSON.stringify(item));
  }

  static get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(this.getKey(key));
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.getKey(key));
        return null;
      }
      return item.value as T;
    } catch {
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  static clear(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('cache_'))
      .forEach((key) => localStorage.removeItem(key));
  }
}

/**
 * Batch multiple updates into a single render
 */
export function batchUpdates<T extends (...args: any[]) => any>(
  callback: T
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    // React 18 automatically batches updates
    callback(...args);
  };
}

/**
 * Lazy load image with placeholder
 */
export function useImageLazyLoad(src: string): {
  imageSrc: string;
  isLoaded: boolean;
} {
  const [imageSrc, setImageSrc] = React.useState<string>('');
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
  }, [src]);

  return { imageSrc, isLoaded };
}

// Need to import React for useState
import React from 'react';
