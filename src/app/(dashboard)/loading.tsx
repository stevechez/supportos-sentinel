function SkeletonBlock({ className }: { className?: string }) {
	return <div className={`animate-pulse rounded-2xl bg-white/[0.04] ${className ?? ''}`} />;
}

export default function DashboardLoading() {
	return (
		<>
			<header className="flex h-16 items-center justify-between border-b border-border bg-background px-6 lg:px-8">
				<div className="space-y-2">
					<div className="h-3.5 w-40 animate-pulse rounded bg-white/[0.06]" />
					<div className="h-3 w-56 animate-pulse rounded bg-white/[0.04]" />
				</div>

				<div className="flex items-center gap-3">
					<div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.04]" />
					<div className="h-8 w-8 animate-pulse rounded-lg bg-white/[0.04]" />
					<div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
				</div>
			</header>

			<div className="space-y-8 px-6 py-8 lg:px-8">
				<SkeletonBlock className="h-32" />

				<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					<SkeletonBlock className="h-28" />
					<SkeletonBlock className="h-28" />
					<SkeletonBlock className="h-28" />
					<SkeletonBlock className="h-28" />
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<SkeletonBlock className="h-64 lg:col-span-2" />
					<SkeletonBlock className="h-64" />
				</div>

				<SkeletonBlock className="h-48" />
			</div>
		</>
	);
}
