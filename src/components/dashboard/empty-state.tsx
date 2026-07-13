import type { ComponentType, SVGProps } from 'react';

interface EmptyStateProps {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	title: string;
	description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center px-6 py-14 text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
				<Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
			</div>

			<h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>

			<p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
				{description}
			</p>
		</div>
	);
}
