import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="text-4xl font-semibold">Page not found</h1>

				<p className="mt-4 text-muted-foreground">
					The page you are looking for does not exist.
				</p>

				<Link href="/" className="mt-6 inline-block text-brand hover:underline">
					Return home
				</Link>
			</div>
		</div>
	);
}
