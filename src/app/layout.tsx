import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';

import { cn } from '@supportos/ui/utils';
import { env } from '@supportos/config/env';
import './globals.css';

// Loaded globally so marketing and dashboard share one design system.
const heading = DM_Serif_Display({
	weight: '400',
	subsets: ['latin'],
	variable: '--font-heading',
	display: 'swap',
});

const body = Manrope({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
});

const siteUrl = env.appUrl;

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: 'Sentinel',
		template: '%s',
	},
	description: 'AI Business Platform',
	icons: {
		icon: '/favicon.ico',
	},
};

export const viewport: Viewport = {
	themeColor: '#09090b',
	colorScheme: 'dark',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={cn(heading.variable, body.variable, 'dark')}>
			<body className="bg-background font-sans text-foreground">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
				>
					Skip to content
				</a>

				{children}
			</body>
		</html>
	);
}
