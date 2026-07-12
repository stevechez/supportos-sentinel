interface PageHeaderProps {
	eyebrow?: string;
	title: string;
	description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
	return (
		<div className="mx-auto max-w-2xl text-center">
			{eyebrow ? (
				<p className="mb-4 text-xs font-medium tracking-[0.14em] text-brand uppercase">
					{eyebrow}
				</p>
			) : null}

			<h1 className="font-heading text-4xl text-foreground sm:text-5xl">
				{title}
			</h1>

			{description ? (
				<p className="mt-6 text-lg leading-8 text-muted-foreground">
					{description}
				</p>
			) : null}
		</div>
	);
}
