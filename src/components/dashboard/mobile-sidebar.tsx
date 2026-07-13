'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Button } from '@supportos/ui/components/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@supportos/ui/components/sheet';
import { SidebarNav } from './sidebar-nav';

export function MobileSidebar() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						aria-label="Open navigation menu"
					/>
				}
			>
				<Menu className="size-5" aria-hidden="true" />
			</SheetTrigger>

			<SheetContent
				side="left"
				className="flex flex-col border-r border-white/10 bg-card p-0"
			>
				<SheetHeader className="border-b px-6 py-5">
					<SheetTitle className="font-heading text-lg">
						SupportOS Sentinel
					</SheetTitle>

					<p className="text-xs text-muted-foreground">
						Customer Intelligence Platform
					</p>
				</SheetHeader>

				<SidebarNav onNavigate={() => setOpen(false)} />

				<div className="border-t p-4">
					<div className="rounded-lg bg-muted p-3">
						<p className="text-xs font-medium">Sentinel Status</p>

						<p className="mt-1 text-xs text-muted-foreground">
							All systems operational
						</p>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
