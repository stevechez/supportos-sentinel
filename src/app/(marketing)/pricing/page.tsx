import { PricingSection } from '@/components/marketing/pricing-section';
import { CtaSection } from '@/components/marketing/cta-section';

export const metadata = {
	title: 'Pricing | Sentinel',
	description: 'One simple plan. Everything included.',
};

export default function PricingPage() {
	return (
		<>
			<div className="pt-8" />
			<PricingSection />
			<CtaSection />
		</>
	);
}
