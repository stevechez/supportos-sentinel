import {
	SIGNAL_TYPES,
	SignalValidationError,
	type NormalizedSignalInput,
	type RawSignalInput,
	type SignalSeverity,
	type SignalType,
} from './types';

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 2000;

const VALID_SEVERITIES: SignalSeverity[] = ['critical', 'high', 'medium', 'low'];

function isSignalType(value: string): value is SignalType {
	return (SIGNAL_TYPES as string[]).includes(value);
}

function isSignalSeverity(value: string): value is SignalSeverity {
	return (VALID_SEVERITIES as string[]).includes(value);
}

/**
 * The one gate every signal passes through before it becomes an
 * OperationalSignal, regardless of where it came from. "Sentinel does not
 * care where it came from" -- but it does care that what lands in
 * sentinel_signals is always well-formed: a known type, a non-empty title,
 * bounded lengths, a known severity or none at all.
 */
export function normalizeSignalInput(raw: RawSignalInput): NormalizedSignalInput {
	const type = raw.type?.trim().toLowerCase();
	if (!type || !isSignalType(type)) {
		throw new SignalValidationError(
			`Unrecognized signal type. Expected one of: ${SIGNAL_TYPES.join(', ')}.`,
		);
	}

	const title = raw.title?.trim();
	if (!title) {
		throw new SignalValidationError('A signal needs a title.');
	}

	const source = raw.source?.trim() || 'manual';

	const content = raw.content?.trim();

	let severity: SignalSeverity | null = null;
	if (raw.severity) {
		const normalizedSeverity = raw.severity.trim().toLowerCase();
		if (normalizedSeverity && !isSignalSeverity(normalizedSeverity)) {
			throw new SignalValidationError(
				`Unrecognized severity. Expected one of: ${VALID_SEVERITIES.join(', ')}, or leave it blank.`,
			);
		}
		severity = (normalizedSeverity || null) as SignalSeverity | null;
	}

	return {
		type,
		source,
		sourceRef: raw.sourceRef?.trim() || null,
		title: title.slice(0, MAX_TITLE_LENGTH),
		content: content ? content.slice(0, MAX_CONTENT_LENGTH) : null,
		severity,
	};
}
