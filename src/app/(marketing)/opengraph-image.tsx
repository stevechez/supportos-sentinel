import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sentinel — AI that just works for your business.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					padding: '96px',
					backgroundColor: '#09090b',
					backgroundImage:
						'radial-gradient(circle at 50% 0%, rgba(129,140,248,0.22), rgba(9,9,11,0) 60%)',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						marginBottom: 40,
					}}
				>
					<div
						style={{
							width: 14,
							height: 14,
							borderRadius: 999,
							backgroundColor: '#818cf8',
							display: 'flex',
						}}
					/>
					<span
						style={{
							fontSize: 32,
							fontWeight: 600,
							color: '#fafafa',
							letterSpacing: '-0.01em',
						}}
					>
						Sentinel
					</span>
				</div>

				<div
					style={{
						fontSize: 68,
						fontWeight: 600,
						color: '#fafafa',
						lineHeight: 1.08,
						letterSpacing: '-0.02em',
						maxWidth: 980,
						display: 'flex',
					}}
				>
					AI that just works for your business.
				</div>

				<div
					style={{
						marginTop: 32,
						fontSize: 30,
						color: '#a1a1aa',
						maxWidth: 820,
						display: 'flex',
					}}
				>
					Customer conversations, support, and business insight — in one
					simple platform.
				</div>
			</div>
		),
		{ ...size },
	);
}
