import * as Slider from '@radix-ui/react-slider';

interface CompositeRangeSliderProps {
  value: [number, number];
  onChange: (next: [number, number]) => void;
}

export function CompositeRangeSlider({
  value,
  onChange,
}: CompositeRangeSliderProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-atlas-label">
        <span>Composite filter</span>
        <span className="font-mono text-atlas-muted">
          {value[0]} … {value[1]}
        </span>
      </div>
      <Slider.Root
        className="relative flex h-6 w-full touch-none select-none items-center"
        min={-5}
        max={10}
        step={1}
        minStepsBetweenThumbs={0}
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]] as [number, number])}
        aria-label="Filter evaluations by composite score range"
      >
        <Slider.Track
          className="relative h-1.5 grow rounded-full"
          style={{
            background:
              'linear-gradient(90deg, #dc2626 0%, #fb923c 22%, #c8c4dc 45%, #a855f7 82%, #c084fc 100%)',
          }}
        >
          <Slider.Range className="absolute h-full rounded-full bg-white/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]" />
        </Slider.Track>
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border-2 border-atlas-bloom bg-atlas-white shadow-atlas-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
          aria-label="Minimum composite"
        />
        <Slider.Thumb
          className="block h-4 w-4 rounded-full border-2 border-atlas-bloom bg-atlas-white shadow-atlas-glow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-atlas-bloom focus-visible:ring-offset-2 focus-visible:ring-offset-atlas-void"
          aria-label="Maximum composite"
        />
      </Slider.Root>
      <p className="text-xs text-atlas-dim">
        Show only frameworks whose composite lies in this band (−5 to +10).
      </p>
    </div>
  );
}
