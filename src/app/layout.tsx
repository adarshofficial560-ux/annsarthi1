import type { Metadata } from 'next';
import './globals.css';
import { FoodRescueProvider } from '../lib/store';

export const metadata: Metadata = {
  title: 'Annsarthi - Closed-Loop AI Food Operations & Zero-Waste OS',
  description: 'India’s National AI & IoT Food Waste Reduction, Predictive Redistribution and Circular Recovery Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white transition-colors">
        <FoodRescueProvider>{children}</FoodRescueProvider>
      </body>
    </html>
  );
}

