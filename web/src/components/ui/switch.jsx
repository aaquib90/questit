import { cn } from '@/lib/utils.js';

export function Switch({ id, checked = false, onCheckedChange, disabled = false, className = '' }) {
	return (
		<button
			type="button"
			id={id}
			role="switch"
			aria-checked={checked}
			disabled={disabled}
			onClick={() => (disabled ? null : onCheckedChange?.(!checked))}
			className={cn(
				'relative inline-flex h-6 w-10 items-center rounded-full border border-border/60 bg-muted transition-colors',
				checked && 'bg-primary/80',
				disabled && 'opacity-50',
				className
			)}
		>
			<span
				aria-hidden="true"
				className={cn(
					'inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform',
					checked ? 'translate-x-5' : 'translate-x-1'
				)}
			/>
		</button>
	);
}

export default Switch;


