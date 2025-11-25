import { Button } from '@/components/ui/button';

export default function GenerateBar({ disabled, isWorking, onSubmit }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 mt-auto rounded-t-2xl border border-border/60 bg-background/90 p-3 backdrop-blur">
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        className="w-full"
        onClick={onSubmit}
      >
        {isWorking ? 'Working…' : 'Make it mine'}
      </Button>
    </div>
  );
}


