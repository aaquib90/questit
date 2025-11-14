import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Surface, Section, PillTray } from '@/components/layout';

const IDEAS = [
	{
		id: 'shopping-list',
		icon: '🛒',
		title: 'Shopping List',
		summary: 'Track what you need to buy',
		prompt: 'Create a simple shopping list where I can add and check off items'
	},
	{
		id: 'mood-journal',
		icon: '😊',
		title: 'Mood Journal',
		summary: 'Track your daily feelings',
		prompt: 'Make a mood tracker where I can pick how I feel today with emojis'
	},
	{
		id: 'recipe-scaler',
		icon: '🧪',
		title: 'Recipe Scaler',
		summary: 'Adjust recipe servings easily',
		prompt: 'Create a tool to scale recipe ingredients up or down for any number of servings'
	},
	{
		id: 'word-counter',
		icon: '✍️',
		title: 'Word Counter',
		summary: 'Count words and characters',
		prompt: 'Make a simple word and character counter with live stats'
	},
	{
		id: 'random-ideas',
		icon: '💡',
		title: 'Random Ideas',
		summary: 'Generate creative prompts',
		prompt: 'Build a random idea generator with different categories like food, activities, and hobbies'
	},
	{
		id: 'quick-timer',
		icon: '⚡',
		title: 'Quick Timer',
		summary: 'Simple countdown timer',
		prompt: 'Create a clean countdown timer with preset options for 5, 10, 15, and 30 minutes'
	}
];

const BENEFITS = [
	{ icon: '✨', title: 'Just Describe What You Want', body: 'Tell us your idea in plain English. Our AI brings it to life instantly—no technical skills needed.' },
	{ icon: '💜', title: 'Works Instantly, Anywhere', body: 'Every tool runs instantly on any device. No downloads, no installation, no waiting.' },
	{ icon: '🎨', title: 'Make It Beautiful', body: 'Choose from gorgeous themes and styles. Every tool can match your personal taste.' },
	{ icon: '🔗', title: 'Share with Anyone', body: 'Share your creation with one click. Get a link that works anywhere in the world.' },
	{ icon: '🛡️', title: 'Your Privacy Matters', body: "Your ideas stay private. We don't collect your personal information or track what you create." },
	{ icon: '🚀', title: 'Super Fast & Reliable', body: "Your tools work instantly, everywhere. Built on the world's fastest infrastructure." }
];

const STEPS = [
	{ n: 1, title: 'Tell Us Your Idea', body: 'Simply type what you want to create. Like asking a friend for help—just be yourself.' },
	{ n: 2, title: 'Watch the Magic Happen', body: 'Our AI builds your tool in seconds. Sit back and watch your idea come to life.' },
	{ n: 3, title: 'Try It & Perfect It', body: "Use your new tool right away. Want changes? Just ask—it's that easy." },
	{ n: 4, title: 'Save & Share', body: 'Love it? Save it for later and share with friends, family, or colleagues.' }
];

export default function Landing({ onStart, onSeeTemplates, onUsePrompt }) {
	return (
		<div className="space-y-16">
			<Section as="section" className="pt-6">
				<div className="mx-auto max-w-4xl text-center">
					<div className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-muted-foreground">
						⚙ Powered by AI Magic
					</div>
					<h1 className="mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
						Turn Ideas into Tools,
						<br />
						Like Magic
					</h1>
					<p className="mx-auto mt-4 max-w-[72ch] text-pretty text-base leading-relaxed text-muted-foreground">
						Create helpful little tools just by describing them. No coding, no complexity, no hassle. If you can
						describe it, we can build it.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button shape="pill" size="lg" className="px-6" onClick={onStart}>
							Start Creating Now
						</Button>
						<Button shape="pill" size="lg" variant="outline" className="px-6" onClick={onSeeTemplates}>
							See Examples
						</Button>
					</div>
					<p className="mt-6 text-xs text-muted-foreground">…or try a popular example:</p>
					<PillTray className="mt-2 justify-center">
						{IDEAS.slice(0, 4).map((idea) => (
							<button
								key={idea.id}
								type="button"
								className="questit-chip"
								onClick={() => onUsePrompt?.(idea.prompt)}
								title={idea.title}
							>
								<span className="mr-1">{idea.icon}</span>
								{idea.title}
							</button>
						))}
					</PillTray>

					<div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
						<div className="flex items-center justify-center gap-2">
							<span>✨ Super Light</span>
							<span className="hidden sm:inline">· Works Anywhere</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<span>⚡ Lightning Fast</span>
							<span className="hidden sm:inline">· Instant Results</span>
						</div>
						<div className="flex items-center justify-center gap-2">
							<span>🎨 Beautiful</span>
							<span className="hidden sm:inline">· Looks Great</span>
						</div>
					</div>
				</div>
			</Section>

			<Section>
				<div className="mx-auto max-w-6xl">
					<h2 className="text-center text-3xl font-semibold tracking-tight">Try One of These Ideas</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Click any card to start building instantly—no signup required!
					</p>
					<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{IDEAS.map((idea) => (
							<Card key={idea.id} className="overflow-hidden">
								<CardContent className="space-y-4 p-6">
									<div className="flex items-start gap-4">
										<div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-xl">
											{idea.icon}
										</div>
										<div className="space-y-1">
											<h3 className="text-lg font-semibold">{idea.title}</h3>
											<p className="text-sm text-muted-foreground">{idea.summary}</p>
										</div>
									</div>
									<p className="rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
										“{idea.prompt}”
									</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
											<span className="inline-block h-2 w-2 rounded-full bg-foreground/60" />
											Try This Idea
										</div>
										<Button size="sm" shape="pill" onClick={() => onUsePrompt?.(idea.prompt)}>
											Try This Idea
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</Section>

			<Section>
				<div className="mx-auto max-w-6xl">
					<h2 className="text-center text-3xl font-semibold tracking-tight">Why People Love Questit</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						Simple to use, powerful enough for anything
					</p>
					<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
						{BENEFITS.map((b) => (
							<Surface key={b.title} muted className="space-y-2 rounded-2xl p-5">
								<div className="flex items-center gap-3">
									<div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15">{b.icon}</div>
									<h3 className="text-base font-semibold">{b.title}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{b.body}</p>
							</Surface>
						))}
					</div>
				</div>
			</Section>

			<Section>
				<div className="mx-auto max-w-6xl">
					<h2 className="text-center text-3xl font-semibold tracking-tight">How It Works</h2>
					<p className="mt-2 text-center text-sm text-muted-foreground">
						From idea to working tool in less than a minute
					</p>
					<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
						{STEPS.map((s) => (
							<Surface key={s.n} muted className="space-y-2 rounded-2xl p-5">
								<div className="flex items-center gap-3">
									<div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white">
										{s.n}
									</div>
									<h3 className="text-base font-semibold">{s.title}</h3>
								</div>
								<p className="text-sm text-muted-foreground">{s.body}</p>
							</Surface>
						))}
					</div>
				</div>
			</Section>

			<Section tight>
				<div className="mx-auto max-w-6xl">
					<div className="rounded-3xl border border-violet-300/40 bg-violet-100/40 p-8 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-violet-900/50 dark:bg-violet-950/20">
						<h3 className="text-2xl font-semibold tracking-tight">Ready to Create Something?</h3>
						<p className="mx-auto mt-2 max-w-[64ch] text-sm text-muted-foreground">
							Join thousands of people bringing their ideas to life. Start creating in seconds—completely free.
						</p>
						<Button shape="pill" size="lg" className="mt-4 px-6" onClick={onStart}>
							Get Started Free
						</Button>
					</div>
				</div>
			</Section>
		</div>
	);
}


