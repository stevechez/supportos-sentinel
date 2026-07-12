import { BusinessFlowSection } from '@/components/marketing/business-flow-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { EcosystemSection } from '@/components/marketing/ecosystem-section';
import { Hero } from '@/components/marketing/hero';
import { PricingSection } from '@/components/marketing/pricing-section';

export default function MarketingPage() {
	return (
		<>
			<Hero />
			<BusinessFlowSection />
			<EcosystemSection />
			<PricingSection />
			<CtaSection />
		</>
	);
}
