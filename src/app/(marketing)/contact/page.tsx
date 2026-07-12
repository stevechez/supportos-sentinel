import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'Contact | Sentinel',
	description: 'Get in touch with the Sentinel team.',
};

export default function ContactPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="Contact"
					title="We're happy to help."
					description="Have a question before you get started, or need help with your account? Reach out and we'll get back to you shortly."
				/>

				<div className="mx-auto mt-16 grid max-w-2xl gap-6 sm:grid-cols-2">
					<div className="rounded-2xl border border-white/10 bg-card p-8">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
							<Mail className="h-5 w-5 text-brand" />
						</div>

						<h2 className="mt-6 text-lg font-medium text-foreground">Email</h2>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							For general questions and account support.
						</p>

						<Link
							href="mailto:hello@sentinel.ai"
							className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
						>
							hello@sentinel.ai
						</Link>
					</div>

					<div className="rounded-2xl border border-white/10 bg-card p-8">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10">
							<MessageCircle className="h-5 w-5 text-brand" />
						</div>

						<h2 className="mt-6 text-lg font-medium text-foreground">
							Talk to sales
						</h2>

						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Curious how Sentinel fits your business? Let&apos;s talk it through.
						</p>

						<Link
							href="mailto:sales@sentinel.ai"
							className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
						>
							sales@sentinel.ai
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
