import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import '../globals.css';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardShell>{children}</DashboardShell>;
}
