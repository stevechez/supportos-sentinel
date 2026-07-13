import { Card, CardContent, CardHeader, CardTitle } from '@supportos/ui/components/card';

interface MetricCardProps {
	title: string;
	value?: string;
	description?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
			</CardHeader>

			<CardContent>
				{value && <div className="text-3xl font-bold">{value}</div>}

				{description && (
					<p className="text-sm text-muted-foreground">{description}</p>
				)}
			</CardContent>
		</Card>
	);
}
