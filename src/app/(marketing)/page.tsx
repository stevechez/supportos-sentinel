import { BusinessFlowSection } from '@/components/marketing/business-flow-section';
import { CtaSection } from '@/components/marketing/cta-section';
import { EcosystemSection } from '@/components/marketing/ecosystem-section';
import { Hero } from '@/components/marketing/hero';
import { PricingSection } from '@/components/marketing/pricing-section';
import { ProblemSection } from '@/components/marketing/problem-section';
import { ProductExperienceSection } from '@/components/marketing/product-experience-section';
import { TrustSection } from './trust-section';

export default function MarketingPage() {
	return (
		<>
			<Hero />
			<ProblemSection />
			<BusinessFlowSection />
			<ProductExperienceSection />
			<EcosystemSection />
			<TrustSection />
			<PricingSection />
			<CtaSection />
		</>
	);
}
