import type { MetadataRoute } from 'next';

import { resources } from '@/content/resources';
import { env } from '@supportos/config/env';

const siteUrl = env.appUrl;

const staticRoutes = [
	{ path: '/', priority: 1, changeFrequency: 'weekly' as const },
	{ path: '/features', priority: 0.8, changeFrequency: 'monthly' as const },
	{ path: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
	{ path: '/products', priority: 0.7, changeFrequency: 'monthly' as const },
	{ path: '/products/chatbot', priority: 0.6, changeFrequency: 'monthly' as const },
	{ path: '/products/sentinel', priority: 0.6, changeFrequency: 'monthly' as const },
	{ path: '/products/supportos', priority: 0.6, changeFrequency: 'monthly' as const },
	{ path: '/resources', priority: 0.6, changeFrequency: 'monthly' as const },
	{ path: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
	{ path: '/contact', priority: 0.5, changeFrequency: 'yearly' as const },
	{ path: '/login', priority: 0.3, changeFrequency: 'yearly' as const },
	{ path: '/signup', priority: 0.8, changeFrequency: 'yearly' as const },
	{ path: '/privacy', priority: 0.2, changeFrequency: 'yearly' as const },
	{ path: '/terms', priority: 0.2, changeFrequency: 'yearly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	const staticEntries = staticRoutes.map(route => ({
		url: `${siteUrl}${route.path}`,
		lastModified: now,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}));

	const resourceEntries = Object.keys(resources).map(slug => ({
		url: `${siteUrl}/resources/${slug}`,
		lastModified: now,
		changeFrequency: 'monthly' as const,
		priority: 0.5,
	}));

	return [...staticEntries, ...resourceEntries];
}
