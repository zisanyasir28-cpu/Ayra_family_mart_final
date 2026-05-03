import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPaisa(paisa: number): string {
  return `৳${(paisa / 100).toFixed(2)}`;
}

export function paisaToTaka(paisa: number): number {
  return paisa / 100;
}

export function takaToPaisa(taka: number): number {
  return Math.round(taka * 100);
}
