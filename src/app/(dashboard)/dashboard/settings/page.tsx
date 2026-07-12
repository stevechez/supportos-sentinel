import {
	Building2,
	Bell,
	CreditCard,
	Link2,
	Settings2,
	Users,
} from 'lucide-react';

import { Container } from '@/components/marketing/container';

const sections = [
	{
		title: 'Business Profile',
		description: 'Help Sentinel understand your business and customers.',
		icon: Building2,
		items: ['Business name', 'Industry', 'Website information'],
	},
	{
		title: 'Connections',
		description: 'Connect the tools Sentinel works with.',
		icon: Link2,
		items: ['Customer conversations', 'Business systems', 'Knowledge sources'],
	},
	{
		title: 'AI Preferences',
		description: 'Choose how Sentinel assists your business.',
		icon: Settings2,
		items: ['Response style', 'Automation preferences', 'Assistant behavior'],
	},
	{
		title: 'Notifications',
		description: 'Choose when Sentinel keeps you informed.',
		icon: Bell,
		items: ['Important findings', 'Weekly reports', 'Recommendations'],
	},
	{
		title: 'Team Access',
		description: 'Manage who can access your Sentinel workspace.',
		icon: Users,
		items: ['Team members', 'Permissions', 'Workspace access'],
	},
	{
		title: 'Subscription',
		description: 'Manage your plan and billing details.',
		icon: CreditCard,
		items: ['Current plan', 'Billing information', 'Usage'],
	},
];

export default function SettingsPage() {
	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Settings
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Manage your Sentinel experience
					</h1>

					<p className="mt-4 text-muted-foreground">
						Customize your business information, connections, and how Sentinel
						helps you.
					</p>
				</div>

				<div className="mt-10 grid gap-5 md:grid-cols-2">
					{sections.map(section => {
						const Icon = section.icon;

						return (
							<div
								key={section.title}
								className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
							>
								<div className="flex gap-4">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
										<Icon className="h-5 w-5 text-brand" />
									</div>

									<div>
										<h2 className="font-medium text-foreground">
											{section.title}
										</h2>

										<p className="mt-2 text-sm text-muted-foreground">
											{section.description}
										</p>
									</div>
								</div>

								<ul className="mt-5 space-y-2 text-sm text-muted-foreground">
									{section.items.map(item => (
										<li key={item}>• {item}</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			</Container>
		</section>
	);
}
