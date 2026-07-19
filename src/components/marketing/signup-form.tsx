'use client';

import { useActionState } from 'react';

import { signup, type SignupState } from '@supportos/auth/actions';
import { SubmitButton } from './submit-button';

// Phase 22 fix -- moved out of the signup page (a Server Component) so the
// form can use useActionState: the signup Server Action now returns
// { error } instead of throwing or redirecting back to this same route on
// every non-success outcome, and this hook is what wires that returned
// state to an inline error message with no page navigation. See the
// comment on `signup` in packages/auth/actions/auth.ts for why the old
// throw/redirect approach broke when bound directly to <form action={...}>.
const initialState: SignupState = {};

export function SignupForm({ initialError }: { initialError?: string }) {
	const [state, formAction] = useActionState(signup, {
		...initialState,
		error: initialError,
	});

	return (
		<form action={formAction} className="mt-10 space-y-4">
			{state.error ? (
				<p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
					{state.error}
				</p>
			) : null}

			<div>
				<label
					htmlFor="business"
					className="mb-1.5 block text-sm font-medium text-foreground/90"
				>
					Business name
				</label>
				<input
					id="business"
					name="business"
					type="text"
					required
					placeholder="Acme Co."
					className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
				/>
			</div>

			<div>
				<label
					htmlFor="email"
					className="mb-1.5 block text-sm font-medium text-foreground/90"
				>
					Work email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="you@company.com"
					className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
				/>
			</div>

			<div>
				<label
					htmlFor="password"
					className="mb-1.5 block text-sm font-medium text-foreground/90"
				>
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minLength={8}
					placeholder="••••••••"
					className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
				/>
				<p className="mt-1.5 text-xs text-muted-foreground">
					At least 8 characters.
				</p>
			</div>

			<SubmitButton pendingLabel="Creating account…">
				Create account
			</SubmitButton>
		</form>
	);
}
