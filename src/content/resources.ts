export const resources = {
	'getting-started': {
		title: 'Getting started with Sentinel',
		description:
			'Connect Sentinel to your business and start helping customers in minutes.',
		readTime: '5 min read',
		sections: [
			{
				title: 'Welcome to Sentinel',
				content:
					'Sentinel brings customer conversations, support, and business insights together in one simple system. You don’t need technical experience or complicated setup.',
			},
			{
				title: 'Connect Sentinel',
				content:
					'Start by connecting Sentinel to the places where your customers interact with your business. Sentinel uses this information to understand your business and provide better responses.',
				list: [
					'Your website',
					'Customer conversations',
					'Support channels',
					'Business information',
				],
			},
			{
				title: 'Add your business knowledge',
				content:
					'Tell Sentinel about your services, products, and common customer questions. The more Sentinel understands, the more helpful it becomes.',
				list: [
					'Your services',
					'Your products',
					'Common customer questions',
					'Important business information',
				],
			},
			{
				title: 'Let Sentinel help',
				content:
					'Once connected, Sentinel helps answer questions, organize conversations, and surface important insights while you stay in control.',
			},
		],
	},
	'managing-conversations': {
		title: 'Managing conversations',
		description:
			'Keep customer questions, leads, and support requests organized in one place.',
		readTime: '4 min read',
		sections: [
			{
				title: 'Every conversation matters',
				content:
					'Customers reach out with questions, requests, feedback, and opportunities. Sentinel helps keep those conversations organized so important details are never missed.',
			},
			{
				title: 'One place for customer communication',
				content:
					'Instead of searching through different tools, Sentinel gives you a clear view of customer conversations.',
				list: [
					'See what customers are asking',
					'Track important requests',
					'Follow up when needed',
					'Keep your team informed',
				],
			},
			{
				title: 'Respond faster',
				content:
					'Sentinel helps your team provide helpful responses, reduce repetitive work, and keep conversations moving.',
			},
			{
				title: 'Stay connected',
				content:
					'The goal is not more software. The goal is better customer relationships.',
			},
		],
	},
	'understanding-insights': {
		title: 'Understanding insights',
		description:
			'See what customers are asking, spot opportunities, and understand what needs attention.',
		readTime: '3 min read',
		sections: [
			{
				title: 'Your customers are telling you what matters',
				content:
					'Every conversation contains valuable information. Sentinel helps uncover patterns so you can better understand your customers.',
			},
			{
				title: 'Understand customer needs',
				content:
					'Discover what customers ask about most and where they may need more clarity.',
				list: [
					'Common questions',
					'Customer concerns',
					'Popular requests',
					'Areas for improvement',
				],
			},
			{
				title: 'Find opportunities',
				content:
					'Use customer insights to improve your website, services, and overall customer experience.',
			},
			{
				title: 'Make better decisions',
				content:
					'You do not need complicated reports. You need clear answers. Sentinel helps you focus on what matters.',
			},
		],
	},
};

export type ResourceSlug = keyof typeof resources;
