import {
	LayoutDashboard,
	MessageSquare,
	Users,
	BarChart3,
	Settings,
	Search,
	CheckCircle2,
	Sparkles,
} from 'lucide-react';

const navItems = [
	{ icon: LayoutDashboard, label: 'Home', active: true },
	{ icon: MessageSquare, label: 'Conversations' },
	{ icon: Users, label: 'Customers' },
	{ icon: BarChart3, label: 'Analytics' },
	{ icon: Settings, label: 'Settings' },
];

const stats = [
	{ label: 'Customer Conversations', value: '12', delta: '+4 new' },
	{ label: 'Support Requests', value: '3', delta: 'resolved' },
];

const activity = [
	{ title: 'Refund request processed', meta: 'Order #1234', time: '2m ago' },
	{ title: 'Customer inquiry resolved', meta: 'acme@example.com', time: '15m ago' },
	{ title: 'Shipping update sent', meta: 'Order #1235', time: '1h ago' },
];

// A static, decorative preview of the Sentinel dashboard — no data fetching,
// purely presentational so the hero visual matches the dark brand instead of
// a mismatched product screenshot.
export function DashboardPreview() {
	return (
		<div
			aria-hidden
			className="flex h-full w-full select-none flex-col overflow-hidden text-left sm:flex-row"
		>
			{/* Mini sidebar */}
			<div className="hidden shrink-0 flex-col gap-1 border-white/10 bg-white/[0.02] p-4 sm:flex sm:w-40 sm:border-r">
				<div className="mb-4 flex items-center gap-2 px-2">
					<div className="h-2 w-2 rounded-full bg-brand" />
					<span className="text-xs font-medium text-foreground/90">
						Sentinel
					</span>
				</div>

				{navItems.map(item => {
					const Icon = item.icon;

					return (
						<div
							key={item.label}
							className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
								item.active
									? 'bg-brand/10 text-brand'
									: 'text-muted-foreground'
							}`}
						>
							<Icon className="h-3.5 w-3.5" />
							{item.label}
						</div>
					);
				})}
			</div>

			{/* Main content */}
			<div className="flex-1 p-5 sm:p-6">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground">
						<Search className="h-3.5 w-3.5" />
						Search
					</div>

					<div className="h-6 w-6 shrink-0 rounded-full bg-white/10" />
				</div>

				<div className="mt-6">
					<p className="text-xs text-muted-foreground">Good afternoon.</p>
					<h3 className="mt-1 text-base font-medium text-foreground">
						Your business is running smoothly.
					</h3>
				</div>

				<div className="mt-5 grid grid-cols-2 gap-3">
					{stats.map(stat => (
						<div
							key={stat.label}
							className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
						>
							<p className="text-[11px] text-muted-foreground">{stat.label}</p>
							<div className="mt-1.5 flex items-baseline gap-1.5">
								<span className="text-lg font-medium text-foreground">
									{stat.value}
								</span>
								<span className="text-[11px] text-brand">{stat.delta}</span>
							</div>
						</div>
					))}

					<div className="col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
						<div className="flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-brand" />
							<span className="text-xs text-foreground/90">AI Health</span>
						</div>
						<span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
							Excellent
						</span>
					</div>
				</div>

				<div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3">
					<p className="mb-2 text-[11px] font-medium text-foreground/80">
						Recent activity
					</p>

					<div className="space-y-2.5">
						{activity.map(item => (
							<div key={item.title} className="flex items-center gap-2.5">
								<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />

								<div className="min-w-0 flex-1">
									<p className="truncate text-xs text-foreground/90">
										{item.title}
									</p>
									<p className="truncate text-[11px] text-muted-foreground">
										{item.meta}
									</p>
								</div>

								<span className="shrink-0 text-[11px] text-muted-foreground">
									{item.time}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
