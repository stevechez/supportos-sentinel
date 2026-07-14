'use client';

import { useEffect } from 'react';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<html lang="en" className="dark">
			<body
				style={{
					background: '#09090b',
					color: '#fafafa',
					fontFamily:
						'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				}}
			>
				<div
					style={{
						minHeight: '100vh',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						textAlign: 'center',
						padding: '1.5rem',
					}}
				>
					<div style={{ maxWidth: '28rem' }}>
						<h1 style={{ fontSize: '1.875rem', fontWeight: 600 }}>
							Something went wrong
						</h1>

						<p style={{ marginTop: '0.75rem', color: '#a1a1aa', fontSize: '0.875rem' }}>
							Sentinel hit an unexpected error. Your data is safe -- nothing
							was changed or lost. Please try again.
						</p>

						<button
							onClick={reset}
							style={{
								marginTop: '2rem',
								borderRadius: '9999px',
								background: '#fafafa',
								color: '#09090b',
								padding: '0.625rem 1.5rem',
								fontSize: '0.875rem',
								fontWeight: 500,
								border: 'none',
								cursor: 'pointer',
							}}
						>
							Try again
						</button>
					</div>
				</div>
			</body>
		</html>
	);
}
