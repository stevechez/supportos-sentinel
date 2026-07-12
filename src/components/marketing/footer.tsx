import Link from 'next/link';
import { Container } from './container';

export function MarketingFooter() {
	return (
		<footer className="border-t border-white/10">
			<Container>
				<div className="flex flex-col gap-10 py-14 md:flex-row md:justify-between">
					<div>
						<Link href="/" className="text-lg font-medium tracking-tight">
							Sentinel
						</Link>

						<p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
							Your AI business assistant — for customer conversations, support,
							and business insight.
						</p>

						<p className="mt-6 text-sm text-muted-foreground">
							Simple setup. Everything connected.
						</p>
					</div>

					<div className="flex gap-12 text-sm">
						<div className="space-y-3">
							<h3 className="font-medium text-foreground/90">Product</h3>

							<Link
								href="/products/chatbot"
								className="block text-muted-foreground transition-colors hover:text-foreground"
							>
								Connect
							</Link>

							<Link
								href="/products/supportos"
								className="block text-muted-foreground transition-colors hover:text-foreground"
							>
								Support
							</Link>

							<Link
								href="/products/sentinel"
								className="block text-muted-foreground transition-colors hover:text-foreground"
							>
								Insights
							</Link>
						</div>

						<div className="space-y-3">
							<h3 className="font-medium text-foreground/90">Company</h3>

							<Link
								href="/about"
								className="block text-muted-foreground transition-colors hover:text-foreground"
							>
								About
							</Link>

							<Link
								href="/contact"
								className="block text-muted-foreground transition-colors hover:text-foreground"
							>
								Contact
							</Link>
						</div>
					</div>
				</div>

				<div className="border-t border-white/10 py-6 text-sm text-muted-foreground">
					© {new Date().getFullYear()} Sentinel. All rights reserved.
				</div>
			</Container>
		</footer>
	);
}
