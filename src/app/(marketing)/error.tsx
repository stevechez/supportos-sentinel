'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { Container } from '@/components/marketing/container';

export default function MarketingError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<section className="flex min-h-[calc(100vh-4rem)] items-center py-24">
			<Container>
				<div className="mx-auto max-w-md text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
						<AlertTriangle className="h-5 w-5 text-destructive" />
					</div>

					<h1 className="font-heading mt-6 text-3xl text-foreground">
						Something went wrong
					</h1>

					<p className="mt-3 text-sm leading-6 text-muted-foreground">
						We hit an unexpected error loading this page. Please try again.
					</p>

					<div className="mt-8 flex items-center justify-center gap-4">
						<button
							onClick={reset}
							className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							Try again
						</button>

						<Link
							href="/"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Return home
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
