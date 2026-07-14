interface SectionHeadingProps {
	/** The question this section answers, e.g. "How are we doing?" -- Phase 13A's executive hierarchy. */
	eyebrow: string;
	/** Optional short context line under the eyebrow. */
	description?: string;
}

// Phase 13A: pure presentation. The dashboard's five priority sections
// (Health Score, Trend, Top Finding, Recommendation, Memory) each answer
// one plain-language question an executive actually asks. This component
// carries no data and no logic -- it only labels the section above it.
export function SectionHeading({ eyebrow, description }: SectionHeadingProps) {
	return (
		<div className="flex items-baseline justify-between">
			<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{eyebrow}
			</h2>
			{description && <p className="text-xs text-muted-foreground">{description}</p>}
		</div>
	);
}
