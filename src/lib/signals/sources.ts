// The controlled vocabulary of where a signal can come from (Phase 9A).
//
// "Sentinel does not care where it came from" (Phase 8) still holds --
// every source normalizes into the same OperationalSignal shape and flows
// through the same ingestSignal() gate. This file exists so the UI can
// show a stable, known list of sources ("Connected Sources", Phase 9D)
// rather than whatever string happens to be in the database, and so a
// future connector has an obvious place to register itself.
//
// Only 'manual' (Phase 8C) and 'supportos' (Phase 9B) are wired to real
// ingestion today. The others are declared so the vocabulary doesn't
// fragment later -- a new connector should add itself here, not invent a
// new ad hoc source string.

export type SignalSource = 'manual' | 'supportos' | 'csv' | 'zendesk' | 'intercom';

export const SIGNAL_SOURCES: SignalSource[] = ['manual', 'supportos', 'csv', 'zendesk', 'intercom'];

export const SIGNAL_SOURCE_LABELS: Record<SignalSource, string> = {
	manual: 'Manual Signals',
	supportos: 'SupportOS',
	csv: 'CSV Import',
	zendesk: 'Zendesk',
	intercom: 'Intercom',
};

/** Sources with a real, wired-up ingestion path today. Everything else in SIGNAL_SOURCES is reserved, not yet connected. */
export const CONNECTED_SIGNAL_SOURCES: SignalSource[] = ['manual', 'supportos'];

export function isSignalSource(value: string): value is SignalSource {
	return (SIGNAL_SOURCES as string[]).includes(value);
}
