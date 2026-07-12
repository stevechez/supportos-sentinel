'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Container } from './container';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetClose,
} from '@/components/ui/sheet';

const links = [
	{ href: '/products', label: 'Solutions' },
	{ href: '/pricing', label: 'Pricing' },
	{ href: '/resources', label: 'Resources' },
];

export function MarketingNavbar() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
			<Container>
				<nav className="flex h-16 items-center justify-between">
					<Link href="/" className="text-lg font-medium tracking-tight">
						Sentinel
					</Link>

					<div className="hidden items-center gap-8 md:flex">
						{links.map(link => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm text-muted-foreground transition-colors hover:text-foreground"
							>
								{link.label}
							</Link>
						))}
					</div>

					<div className="hidden items-center gap-4 md:flex">
						<Link
							href="/login"
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							Login
						</Link>

						<Link
							href="/signup"
							className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							Get Started
						</Link>
					</div>

					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									className="md:hidden"
									aria-label="Open menu"
								/>
							}
						>
							<Menu className="size-5" />
						</SheetTrigger>

						<SheetContent
							side="right"
							className="border-l border-white/10 bg-popover/95 backdrop-blur-md"
						>
							<SheetHeader>
								<SheetTitle>Sentinel</SheetTitle>
							</SheetHeader>

							<div className="flex flex-col gap-1 px-4">
								{links.map(link => (
									<SheetClose
										key={link.href}
										render={
											<Link
												href={link.href}
												className="rounded-lg px-2 py-3 text-base text-foreground/90 transition-colors hover:bg-white/5"
											/>
										}
									>
										{link.label}
									</SheetClose>
								))}
							</div>

							<div className="mt-auto flex flex-col gap-3 border-t border-white/10 p-4">
								<SheetClose
									render={
										<Link
											href="/login"
											className="text-center text-sm font-medium text-muted-foreground"
										/>
									}
								>
									Login
								</SheetClose>

								<SheetClose
									render={
										<Link
											href="/signup"
											className="rounded-full bg-primary px-5 py-3 text-center text-sm font-medium text-primary-foreground"
										/>
									}
								>
									Get Started
								</SheetClose>
							</div>
						</SheetContent>
					</Sheet>
				</nav>
			</Container>
		</header>
	);
}
