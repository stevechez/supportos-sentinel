import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Privacy Policy | Sentinel',
	description: 'How Sentinel collects, uses, and protects your data.',
};

export default function PrivacyPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader eyebrow="Legal" title="Privacy Policy" />

				<div className="mx-auto mt-16 max-w-2xl space-y-8 text-sm leading-7 text-muted-foreground">
					<p>
						Last updated: this page is a placeholder and should be replaced
						with a policy reviewed by your legal counsel before launch.
					</p>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Information we collect
						</h2>
						<p>
							Sentinel collects information you provide directly, such as
							account and business details, along with information generated
							through your use of the platform, such as customer conversations
							and support activity.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							How we use information
						</h2>
						<p>
							We use this information to operate Sentinel, provide support
							insights, maintain security, and improve the product over time.
							We do not sell your data.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Data retention
						</h2>
						<p>
							Data is retained for as long as your account is active, or as
							needed to provide the service and meet legal obligations.
						</p>
					</div>

					<div>
						<h2 className="mb-2 text-base font-medium text-foreground">
							Contact
						</h2>
						<p>
							Questions about this policy can be sent to{' '}
							<a
								href="mailto:privacy@sentinel.ai"
								className="text-brand hover:underline"
							>
								privacy@sentinel.ai
							</a>
							.
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}
