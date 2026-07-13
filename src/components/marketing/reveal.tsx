'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@supportos/ui/utils';

interface RevealProps {
	children: React.ReactNode;
	delay?: number;
	className?: string;
}

export function Reveal({ children, delay = 0, className }: RevealProps) {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const frame = requestAnimationFrame(() => setVisible(true));
			return () => cancelAnimationFrame(frame);
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ threshold: 0.15 },
		);

		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className={cn(
				'transition-all duration-700 ease-out',
				visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
				className,
			)}
			style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
		>
			{children}
		</div>
	);
}
