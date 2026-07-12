import type { Metadata, Viewport } from 'next';

import './globals.css';

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
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
