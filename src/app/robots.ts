import type { MetadataRoute } from 'next';

import { env } from '@supportos/config/env';

const siteUrl = env.appUrl;

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/dashboard', '/findings', '/recommendations', '/reports'],
			},
		],
		sitemap: `${siteUrl}/sitemap.xml`,
	};
}
