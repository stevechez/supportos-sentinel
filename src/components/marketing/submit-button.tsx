'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
	children: React.ReactNode;
	pendingLabel: string;
}

export function SubmitButton({ children, pendingLabel }: SubmitButtonProps) {
	const { pending } = useFormStatus();

	return (
		<button
			type="submit"
			disabled={pending}
			className="mt-2 w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{pending ? pendingLabel : children}
		</button>
	);
}
