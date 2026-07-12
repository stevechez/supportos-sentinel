import { Container } from '@/components/marketing/container';
import { PageHeader } from '@/components/marketing/page-header';

export const metadata = {
	title: 'About | Sentinel',
	description:
		'Sentinel builds AI that just works for your business — calm, simple, and connected.',
};

const values = [
	{
		title: 'Simple over clever',
		description:
			'We would rather remove a feature than explain it. If it needs a manual, it is not ready.',
	},
	{
		title: 'Calm by design',
		description:
			'Software should feel quiet and dependable, not loud and demanding your attention.',
	},
	{
		title: 'One connected system',
		description:
			'Customer conversations, support, and insight should live together, not in separate tools.',
	},
];

export default function AboutPage() {
	return (
		<section className="py-24 sm:py-32">
			<Container>
				<PageHeader
					eyebrow="About Sentinel"
					title="AI should disappear into the background."
					description="Most software makes you work harder to feel in control. Sentinel was built on the opposite idea — that a business assistant should just quietly handle things, so you can focus on your customers."
				/>

				<div className="mt-16 grid gap-6 md:grid-cols-3">
					{values.map(value => (
						<div
							key={value.title}
							className="rounded-2xl border border-white/10 bg-card p-8"
						>
							<h2 className="text-lg font-medium text-foreground">
								{value.title}
							</h2>

							<p className="mt-3 text-sm leading-7 text-muted-foreground">
								{value.description}
							</p>
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
