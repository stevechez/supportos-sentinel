import { createClient } from '@supportos/auth/server';

import { getCurrentMembership } from '@/lib/dashboard/dashboard';

// Phase 21/v2 -- the first UI over the `customers` table. Per the Phase
// 21A audit, `customers` already exists and is populated (real rows, real
// RLS) but had zero application code reading or writing it anywhere in
// this codebase -- every other page reads tickets/messages, never the
// customer record those tickets point back to. This is a narrow,
// read-only list: contact info plus a ticket count, not a CRM.

const CUSTOMER_LIST_LIMIT = 100;

export interface CustomerListItem {
	id: string;
	name: string | null;
	email: string | null;
	company: string | null;
	ticketCount: number;
	lastContactAt: string | null;
	createdAt: string;
}

export async function getCustomers(): Promise<CustomerListItem[] | null> {
	const membership = await getCurrentMembership();
	if (!membership) {
		return null;
	}

	const supabase = await createClient();

	const { data: customers, error } = await supabase
		.from('customers')
		.select('id, name, email, company, created_at')
		.eq('organization_id', membership.organizationId)
		.order('created_at', { ascending: false })
		.limit(CUSTOMER_LIST_LIMIT);

	if (error) {
		console.error('[customers] fetching customers:', error);
		return [];
	}

	const customerRows = customers ?? [];
	const customerIds = customerRows.map(row => row.id);

	const { data: tickets, error: ticketsError } =
		customerIds.length === 0
			? { data: [] as { customer_id: string | null; created_at: string }[], error: null }
			: await supabase
					.from('tickets')
					.select('customer_id, created_at')
					.eq('organization_id', membership.organizationId)
					.in('customer_id', customerIds);

	if (ticketsError) {
		console.error('[customers] fetching ticket counts:', ticketsError);
	}

	const statsByCustomer = new Map<string, { count: number; lastContactAt: string | null }>();
	for (const row of tickets ?? []) {
		if (!row.customer_id) {
			continue;
		}
		const existing = statsByCustomer.get(row.customer_id) ?? { count: 0, lastContactAt: null };
		existing.count += 1;
		if (!existing.lastContactAt || row.created_at > existing.lastContactAt) {
			existing.lastContactAt = row.created_at;
		}
		statsByCustomer.set(row.customer_id, existing);
	}

	return customerRows.map(row => {
		const stats = statsByCustomer.get(row.id);
		return {
			id: row.id,
			name: row.name,
			email: row.email,
			company: row.company,
			ticketCount: stats?.count ?? 0,
			lastContactAt: stats?.lastContactAt ?? null,
			createdAt: row.created_at,
		};
	});
}
