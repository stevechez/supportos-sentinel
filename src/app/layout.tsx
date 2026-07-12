import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';

import { cn } from '@/lib/utils';
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
		<html
			lang="en"
			className={cn(heading.variable, body.variable, 'dark')}
		>
			<body className="bg-background font-sans text-foreground">
				{children}
			</body>
		</html>
	);
}
