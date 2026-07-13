import { Card, CardContent, CardHeader, CardTitle } from '@supportos/ui/components/card';

interface InsightCardProps {
	title: string;
	description: string;
	severity?: 'critical' | 'warning' | 'info';
}

export function InsightCard({
	title,
	description,
	severity = 'info',
}: InsightCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between text-base">
					{title}

					<span className="rounded-full bg-muted px-2 py-1 text-xs capitalize">
						{severity}
					</span>
				</CardTitle>
			</CardHeader>

			<CardContent>
				<p className="text-sm text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}
