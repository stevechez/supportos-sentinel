'use client';

import { useState, useTransition } from 'react';
import { Pencil } from 'lucide-react';

import { updatePilotContactAction } from '@/lib/founder/actions';

interface PilotContactEditorProps {
	organizationId: string;
	name: string | null;
	email: string | null;
}

// Phase 20B -- primary contact, editable inline. Collapsed to plain text
// until clicked, since most rows will just be read, not edited, in any
// given weekly review.
export function PilotContactEditor({ organizationId, name, email }: PilotContactEditorProps) {
	const [editing, setEditing] = useState(false);
	const [nameValue, setNameValue] = useState(name ?? '');
	const [emailValue, setEmailValue] = useState(email ?? '');
	const [isPending, startTransition] = useTransition();

	function handleSave() {
		startTransition(async () => {
			await updatePilotContactAction(organizationId, nameValue, emailValue);
			setEditing(false);
		});
	}

	if (!editing) {
		return (
			<button
				type="button"
				onClick={() => setEditing(true)}
				className="group flex items-center gap-1.5 text-left text-muted-foreground hover:text-foreground"
			>
				<span>{name || email ? `${name ?? ''}${name && email ? ' · ' : ''}${email ?? ''}` : 'Add contact'}</span>
				<Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
			</button>
		);
	}

	return (
		<div className="flex flex-col gap-1.5">
			<input
				value={nameValue}
				onChange={e => setNameValue(e.target.value)}
				placeholder="Name"
				className="rounded-md border border-white/10 bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
			/>
			<input
				value={emailValue}
				onChange={e => setEmailValue(e.target.value)}
				placeholder="Email"
				className="rounded-md border border-white/10 bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
			/>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={handleSave}
					disabled={isPending}
					className="text-xs font-medium text-brand hover:underline"
				>
					{isPending ? 'Saving…' : 'Save'}
				</button>
				<button
					type="button"
					onClick={() => setEditing(false)}
					className="text-xs text-muted-foreground hover:text-foreground"
				>
					Cancel
				</button>
			</div>
		</div>
	);
}
