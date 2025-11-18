import { useEffect, useRef, useState } from 'react';
import { Surface } from '@/components/layout';
import { cn } from '@/lib/utils.js';

const BUILD_STAGES = [
	{
		icon: '❤️',
		title: 'Understanding Your Vision',
		description: 'Listening to your prompt and gathering inspiration…'
	},
	{
		icon: '🧠',
		title: 'Planning the Flow',
		description: 'Sketching out logic, UI states, and helper hooks…'
	},
	{
		icon: '🧩',
		title: 'Assembling Components',
		description: 'Stitching together reusable Questit snippets and styles…'
	},
	{
		icon: '⚡',
		title: 'Running Safety Checks',
		description: 'Hardening inputs and running quick static scans…'
	},
	{
		icon: '🚀',
		title: 'Polishing for Launch',
		description: 'Adding final touches so you can test right away.'
	}
];

export default function GeneratingAnimation() {
	const [percent, setPercent] = useState(12);
	const [activeStage, setActiveStage] = useState(0);
	const [emojiTick, setEmojiTick] = useState(0);
	const percentIntervalRef = useRef(null);

	useEffect(() => {
		percentIntervalRef.current = setInterval(() => {
			setPercent((p) => {
				const next = p + Math.max(0.3, (95 - p) * 0.06);
				return next > 95 ? 95 : Number(next.toFixed(1));
			});
		}, 250);
		return () => {
			if (percentIntervalRef.current) clearInterval(percentIntervalRef.current);
		};
	}, []);

	useEffect(() => {
		const stageTimer = setInterval(() => {
			setActiveStage((current) => (current + 1) % BUILD_STAGES.length);
		}, 1400);
		return () => clearInterval(stageTimer);
	}, []);

	useEffect(() => {
		const wobbleTimer = setInterval(() => {
			setEmojiTick((tick) => tick + 1);
		}, 900);
		return () => clearInterval(wobbleTimer);
	}, []);

	const stage = BUILD_STAGES[activeStage];
	const emojiTransforms = [
		'scale(0.94) rotate(-6deg)',
		'scale(1.08) rotate(6deg)',
		'scale(1.02)',
		'scale(1.06) rotate(-3deg)'
	];
	const emojiTransform = emojiTransforms[emojiTick % emojiTransforms.length];

	return (
		<Surface muted className="overflow-hidden rounded-2xl p-0">
			<div className="relative">
				<div className="h-40 w-full bg-gradient-to-b from-fuchsia-200/60 via-pink-100/60 to-white dark:from-fuchsia-900/30 dark:via-fuchsia-950/20 dark:to-slate-900" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="relative grid h-[4.5rem] w-[4.5rem] place-items-center">
						<div className="absolute h-20 w-20 rounded-full bg-fuchsia-500/20 blur-xl dark:bg-fuchsia-400/15" />
						<div
							className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-transform duration-500 ease-in-out dark:bg-slate-900"
							style={{ transform: emojiTransform }}
						>
							<span className="text-3xl" aria-hidden>
								{stage.icon}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className="space-y-4 p-6">
				<div className="space-y-1">
					<h3 className="text-base font-semibold text-foreground">{stage.title}</h3>
					<p className="text-sm text-muted-foreground">{stage.description}</p>
				</div>
				<div className="space-y-2">
					<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-[width] duration-300 ease-out"
							style={{ width: `${percent}%` }}
						/>
					</div>
					<div className="flex items-center justify-between text-[11px] text-muted-foreground">
						<span>⚡ {percent}% Complete</span>
						<span>
							Step {activeStage + 1} of {BUILD_STAGES.length}
						</span>
					</div>
				</div>
				<div className="flex items-center justify-between px-2 pt-1">
					{BUILD_STAGES.map((item, index) => {
						const isActive = index === activeStage;
						return (
							<span
								key={item.icon}
								className={cn(
									'grid h-8 w-8 place-items-center rounded-full text-base transition-all duration-500 ease-out',
									isActive
										? 'bg-fuchsia-500/15 text-fuchsia-600 shadow shadow-fuchsia-500/20 dark:bg-fuchsia-400/10 dark:text-fuchsia-200'
										: 'bg-muted text-muted-foreground'
								)}
								style={{ transform: isActive ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)' }}
							>
								{item.icon}
							</span>
						);
					})}
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
