'use client';

import { useState, useTransition } from 'react';
import { AlertTriangle, ArrowUpRight, ListChecks, ShieldAlert, Wand2 } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';

import { generateExecutiveBriefAction } from '@/lib/ai/actions';
import type { ExecutiveBrief } from '@/lib/ai/types';

import { InsightFeedback } from './insight-feedback';

type State =
	| { status: 'idle' }
	| { status: 'loading' }
	| { status: 'success'; brief: ExecutiveBrief }
	| { status: 'error'; message: string };

export function AiExecutiveBriefCard() {
	const [state, setState] = useState<State>({ status: 'idle' });
	const [isPending, startTransition] = useTransition();

	function handleGenerate() {
		setState({ status: 'loading' });
		startTransition(async () => {
			const result = await generateExecutiveBriefAction();
			if (result.ok) {
				setState({ status: 'success', brief: result.brief });
			} else {
				setState({ status: 'error', message: result.error });
			}
		});
	}

	const isLoading = isPending || state.status === 'loading';

	return (
		<div className="rounded-xl border bg-card shadow-sm">
			<div className="flex items-center justify-between gap-4 border-b px-6 py-4">
				<div className="flex items-center gap-2">
					<Wand2 className="h-5 w-5 text-primary" aria-hidden="true" />

					<div>
						<h2 className="font-heading text-lg text-foreground">
							AI Executive Brief
						</h2>

						<p className="text-sm text-muted-foreground">
							A plain-language explanation of the report above, written for leadership
						</p>
					</div>
				</div>

				<Button size="sm" onClick={handleGenerate} disabled={isLoading}>
					{isLoading ? 'Generating…' : state.status === 'success' ? 'Regenerate' : 'Generate AI Brief'}
				</Button>
			</div>

			<div className="p-6">
				{state.status === 'idle' && (
					<p className="text-sm text-muted-foreground">
						Sentinel has already calculated your health score, findings, and
						recommendations above. Click Generate to have it explained in a
						few sentences you can hand straight to leadership.
					</p>
				)}

				{isLoading && (
					<div className="space-y-3">
						<div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
						<div className="h-3 w-full animate-pulse rounded bg-muted" />
						<div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
					</div>
				)}

				{state.status === 'error' && (
					<div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
						<div>
							<p className="text-sm text-foreground">{state.message}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								The rest of your dashboard is unaffected -- this only affects the AI brief.
							</p>
						</div>
					</div>
				)}

				{state.status === 'success' && (
					<div className="space-y-6">
						<p className="text-base leading-7 text-foreground">{state.brief.summary}</p>

						<div className="grid gap-6 sm:grid-cols-3">
							<BriefSection
								icon={ArrowUpRight}
								label="What Improved"
								items={state.brief.improvements}
								emptyText="Nothing notable improved this period."
								accentClassName="text-emerald-400"
							/>

							<BriefSection
								icon={ShieldAlert}
								label="Biggest Risks"
								items={state.brief.risks}
								emptyText="No major risks called out."
								accentClassName="text-destructive"
							/>

							<BriefSection
								icon={ListChecks}
								label="Recommended Priorities"
								items={state.brief.priorities}
								emptyText="No priorities called out."
								accentClassName="text-primary"
							/>
						</div>

						<div className="border-t pt-4">
							<InsightFeedback context="ai_executive_brief" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

interface BriefSectionProps {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	items: string[];
	emptyText: string;
	accentClassName: string;
}

function BriefSection({ icon: Icon, label, items, emptyText, accentClassName }: BriefSectionProps) {
	return (
		<div>
			<div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${accentClassName}`}>
				<Icon className="h-3.5 w-3.5" aria-hidden="true" />
				{label}
			</div>

			{items.length === 0 ? (
				<p className="mt-2 text-sm text-muted-foreground">{emptyText}</p>
			) : (
				<ul className="mt-2 space-y-1.5">
					{items.map(item => (
						<li key={item} className="text-sm leading-6 text-foreground">
							{item}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
