import { useEffect, useRef, useState } from 'react';
import { Surface } from '@/components/layout';

export default function GeneratingAnimation() {
	const [percent, setPercent] = useState(12);
	const intervalRef = useRef(null);

	useEffect(() => {
		// Ease towards 95% while generating; unmount will clear it
		intervalRef.current = setInterval(() => {
			setPercent((p) => {
				const next = p + Math.max(0.3, (95 - p) * 0.06);
				return next > 95 ? 95 : Number(next.toFixed(1));
			});
		}, 250);
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, []);

	return (
		<Surface muted className="overflow-hidden rounded-2xl p-0">
			<div className="relative">
				<div className="h-40 w-full bg-gradient-to-b from-fuchsia-200/60 via-pink-100/60 to-white dark:from-fuchsia-900/30 dark:via-fuchsia-950/20 dark:to-slate-900" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5 dark:bg-slate-900">
						<span className="text-3xl">🤔</span>
					</div>
				</div>
			</div>
			<div className="space-y-3 p-6">
				<div>
					<h3 className="text-base font-semibold">Understanding Your Vision</h3>
					<p className="text-sm text-muted-foreground">
						Reading your idea and getting inspired…
					</p>
				</div>
				<div className="space-y-1">
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-[width] duration-300 ease-out"
							style={{ width: `${percent}%` }}
						/>
					</div>
					<div className="flex items-center justify-between text-[11px] text-muted-foreground">
						<span>⚡ {percent}% Complete</span>
						<span>Step 1 of 5</span>
					</div>
				</div>
				<div className="flex items-center justify-between px-2 pt-1">
					<span className="grid h-8 w-8 place-items-center rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
						❤️
					</span>
					<span className="grid h-8 w-8 place-items-center rounded-full bg-muted">🧠</span>
					<span className="grid h-8 w-8 place-items-center rounded-full bg-muted">🧩</span>
					<span className="grid h-8 w-8 place-items-center rounded-full bg-muted">⚡</span>
					<span className="grid h-8 w-8 place-items-center rounded-full bg-muted">🚀</span>
				</div>
				<div className="pt-2">
					<p className="mx-auto w-fit rounded-full bg-pink-50 px-3 py-1 text-xs text-pink-700 ring-1 ring-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:ring-pink-900/40">
						💖 Your tool is being crafted with care
					</p>
				</div>
			</div>
		</Surface>
	);
}


