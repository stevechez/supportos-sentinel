import { notFound } from 'next/navigation';

import { ResourceContent } from '@/components/marketing/resource-content';
import { SentinelConnectedPreview } from '@/components/marketing/sentinel-connected-preview';
import { resources } from '@/content/resources';

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

// Per-resource illustrations — kept out of content/resources.ts since that
// file is plain data (no JSX). Only "getting-started" has one for now.
const visuals: Partial<Record<keyof typeof resources, React.ReactNode>> = {
	'getting-started': <SentinelConnectedPreview />,
};

export function generateStaticParams() {
	return Object.keys(resources).map(slug => ({
		slug,
	}));
}

export default async function ResourcePage({ params }: PageProps) {
	const { slug } = await params;

	const resource = resources[slug as keyof typeof resources];

	if (!resource) {
		notFound();
	}

	return (
		<ResourceContent {...resource} visual={visuals[slug as keyof typeof resources]} />
	);
}
