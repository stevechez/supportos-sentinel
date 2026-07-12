import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Terms of Service | Sentinel',
	description: 'The terms that govern your use of Sentinel.',
};

export default function TermsPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader eyebrow="Legal" title="Terms of Service" />

				<div className="mx-auto mt-16 max-w-2xl space-y-8 text-sm leading-7 text-muted-foreground">
					<p>
						Last updated: this page is a placeholder and should be replaced
						with terms reviewed by your legal counsel before launch.
					</p>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Using Sentinel
						</h2>
						<p>
							By creating an account, you agree to use Sentinel only for
							lawful business purposes and in accordance with these terms.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Subscriptions and billing
						</h2>
						<p>
							Sentinel is billed monthly. You can cancel at any time, and
							access continues through the end of your current billing
							period.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Your data
						</h2>
						<p>
							You retain ownership of the business and customer data you bring
							into Sentinel. We use it only to provide and improve the
							service, as described in our Privacy Policy.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Changes to these terms
						</h2>
						<p>
							We may update these terms from time to time. We&apos;ll let you know
							if a change materially affects how you use Sentinel.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Contact
						</h2>
						<p>
							Questions about these terms can be sent to{' '}
							<a
								href="mailto:legal@sentinel.ai"
								className="text-brand hover:underline"
							>
								legal@sentinel.ai
							</a>
							.
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}
