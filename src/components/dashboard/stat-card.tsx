import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
	title: string;
	value: string;
	description?: string;
	icon?: React.ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
	return (
		<Card>
			<CardContent className="flex items-start justify-between p-6">
				<div>
					<p className="text-sm text-muted-foreground">{title}</p>

					<p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

					{description && (
						<p className="mt-2 text-xs text-muted-foreground">{description}</p>
					)}
				</div>

				{icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
			</CardContent>
		</Card>
	);
}
