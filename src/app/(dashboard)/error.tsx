'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
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
		<div className="flex flex-1 items-center justify-center px-6 py-24">
			<div className="max-w-md text-center">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
					<AlertTriangle className="h-5 w-5 text-destructive" />
				</div>

				<h1 className="font-heading mt-6 text-2xl text-foreground">
					Something went wrong
				</h1>

				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					Sentinel hit an unexpected error loading this page. You can try
					again, or head back to your overview.
				</p>

				<div className="mt-8 flex items-center justify-center gap-4">
					<button
						onClick={reset}
						className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
					>
						Try again
					</button>

					<Link
						href="/dashboard"
						className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						Back to overview
					</Link>
				</div>
			</div>
		</div>
	);
}
