import { DM_Serif_Display, Manrope } from 'next/font/google';

import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';
import { cn } from '@/lib/utils';
import '../globals.css';

// Fonts are scoped to the marketing route group only, so the dashboard
// keeps its existing typography untouched.
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

const title = 'Sentinel | AI that just works for your business';
const description =
	'Sentinel brings customer conversations, support, and business insights together in one simple platform.';

export const metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		type: 'website',
		siteName: 'Sentinel',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description,
	},
};

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				heading.variable,
				body.variable,
				// Dark-first: scoped to this layout so dashboard routes are unaffected.
				'dark flex min-h-screen flex-col bg-background font-sans text-foreground',
			)}
		>
			<MarketingNavbar />

			<main className="flex-1">{children}</main>

			<MarketingFooter />
		</div>
	);
}
