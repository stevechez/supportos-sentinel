import { Users } from 'lucide-react';

import { Container } from '@/components/marketing/container';
import { EmptyState } from '@/components/dashboard/empty-state';
import { getCustomers } from '@/lib/customers/data';

function formatDate(value: string | null): string {
	if (!value) {
		return 'No contact yet';
	}
	return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function CustomersPage() {
	const customers = await getCustomers();

	return (
		<section className="py-10">
			<Container>
				<div className="max-w-3xl">
					<p className="text-sm font-medium uppercase tracking-wide text-brand">
						Customers
					</p>

					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
						Your customers
					</h1>

					<p className="mt-4 text-muted-foreground">
						Everyone who&rsquo;s reached out, and how many conversations
						they&rsquo;ve had with you.
					</p>
				</div>

				{!customers || customers.length === 0 ? (
					<div className="mt-10">
						<EmptyState
							icon={Users}
							title="No customers yet"
							description="Customers show up here once conversations start coming in, or after someone tries the AI Assistant."
						/>
					</div>
				) : (
					<div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
						<table className="w-full text-left text-sm">
							<thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
								<tr>
									<th className="px-5 py-3 font-medium">Customer</th>
									<th className="px-5 py-3 font-medium">Company</th>
									<th className="px-5 py-3 font-medium">Conversations</th>
									<th className="px-5 py-3 font-medium">Last contact</th>
								</tr>
							</thead>
							<tbody className="divide-y">
								{customers.map(customer => (
									<tr key={customer.id} className="transition-colors hover:bg-muted/30">
										<td className="px-5 py-3">
											<div className="font-medium text-foreground">
												{customer.name ?? 'Unnamed customer'}
											</div>
											{customer.email && (
												<div className="text-xs text-muted-foreground">{customer.email}</div>
											)}
										</td>
										<td className="px-5 py-3 text-muted-foreground">{customer.company ?? '—'}</td>
										<td className="px-5 py-3 text-foreground">{customer.ticketCount}</td>
										<td className="px-5 py-3 text-muted-foreground">{formatDate(customer.lastContactAt)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Container>
		</section>
	);
}
