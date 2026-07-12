import { Building2, MessagesSquare, BookOpenCheck, Check } from 'lucide-react';

const checklist = [
	{ icon: Building2, label: 'Business profile' },
	{ icon: MessagesSquare, label: 'Customer conversations' },
	{ icon: BookOpenCheck, label: 'Knowledge ready' },
];

// A calm, static illustration — no chart, no robot, no sci-fi. Just a
// glass card confirming setup is complete. Used alongside long-form
// resource content, mirroring the hero's dashboard visual treatment.
export function SentinelConnectedPreview() {
	return (
		<div
			aria-hidden
			className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-card"
		>
			{/* Soft ambient glow */}
			<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
				<div className="h-64 w-64 rounded-full bg-brand/20 blur-[90px]" />
			</div>
			<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
				<div className="h-56 w-72 rounded-full bg-emerald-400/10 blur-[100px]" />
			</div>

			{/* Faint offset card behind, for depth */}
			<div className="absolute h-[72%] w-[78%] translate-x-3 translate-y-3 rounded-2xl border border-white/5 bg-white/[0.02]" />

			{/* Glass card */}
			<div className="relative w-[78%] rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
				<div className="flex items-center gap-2.5">
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
					</span>
					<span className="text-sm font-medium text-foreground">
						Sentinel Connected
					</span>
				</div>

				<div className="mt-5 space-y-3 border-t border-white/10 pt-5">
					{checklist.map(item => {
						const Icon = item.icon;

						return (
							<div key={item.label} className="flex items-center gap-3">
								<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
									<Icon className="h-4 w-4 text-muted-foreground" />
								</div>

								<span className="flex-1 text-sm text-foreground/90">
									{item.label}
								</span>

								<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
									<Check className="h-3 w-3 text-emerald-400" />
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
