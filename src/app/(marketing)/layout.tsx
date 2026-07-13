import { MarketingNavbar } from '@/components/marketing/navbar';
import { MarketingFooter } from '@/components/marketing/footer';
import '../globals.css';

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
		<div className="flex min-h-screen flex-col">
			<MarketingNavbar />

			<main id="main-content" className="flex-1">
				{children}
			</main>

			<MarketingFooter />
		</div>
	);
}
