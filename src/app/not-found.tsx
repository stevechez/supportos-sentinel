import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Page not found | Sentinel',
	description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
	return (
		<main
			id="main-content"
			className="flex min-h-screen items-center justify-center px-6"
		>
			<div className="text-center">
				<p className="text-sm font-medium uppercase tracking-wide text-brand">
					404
				</p>

				<h1 className="font-heading mt-3 text-4xl text-foreground">
					Page not found
				</h1>

				<p className="mt-4 text-muted-foreground">
					The page you are looking for does not exist.
				</p>

				<Link
					href="/"
					className="mt-8 inline-block rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
				>
					Return home
				</Link>
			</div>
		</main>
	);
}
