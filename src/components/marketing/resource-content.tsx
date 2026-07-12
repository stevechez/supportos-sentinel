import type { ReactNode } from 'react';

import { Container } from '@/components/marketing/container';

type ResourceSection = {
	title: string;
	content: string;
	list?: string[];
};

type ResourceContentProps = {
	title: string;
	description: string;
	readTime: string;
	sections: ResourceSection[];
	visual?: ReactNode;
};

export function ResourceContent({
	title,
	description,
	readTime,
	sections,
	visual,
}: ResourceContentProps) {
	const body = (
		<div className="max-w-3xl">
			<p className="text-sm font-medium uppercase tracking-wide text-brand">
				{readTime}
			</p>

			<h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
				{title}
			</h1>

			<p className="mt-6 text-lg leading-8 text-muted-foreground">
				{description}
			</p>

			<div className="mt-16 space-y-12">
				{sections.map(section => (
					<div key={section.title}>
						<h2 className="text-2xl font-semibold text-foreground">
							{section.title}
						</h2>

						<p className="mt-4 leading-8 text-muted-foreground">
							{section.content}
						</p>

						{section.list && (
							<ul className="mt-6 space-y-3 text-muted-foreground">
								{section.list.map(item => (
									<li key={item} className="flex gap-3">
										<span className="text-brand">•</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						)}
					</div>
				))}
			</div>
		</div>
	);

	if (!visual) {
		return (
			<section className="py-24 sm:py-32">
				<Container>
					<div className="mx-auto">{body}</div>
				</Container>
			</section>
		);
	}

	return (
		<section className="py-24 sm:py-32">
			<Container>
				<div className="mx-auto grid max-w-5xl gap-16 lg:grid-cols-[1fr_320px] lg:items-start">
					{body}

					<div className="order-first lg:sticky lg:top-28 lg:order-last">
						{visual}
					</div>
				</div>
			</Container>
		</section>
	);
}
