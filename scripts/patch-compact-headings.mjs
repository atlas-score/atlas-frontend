import fs from 'fs';

const p = 'src/components/EvaluationDetailCompact.tsx';
let c = fs.readFileSync(p, 'utf8');

const d = 'd' + 'iv';

const oldBlock = `function CompactBlock({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <${d} className={cn('mt-5 first:mt-0', className)}>{children}</${d}>;
}`;

const newBlock = `function CompactBlock({
  children,
  className,
  divider = true,
}: {
  children: ReactNode;
  className?: string;
  divider?: boolean;
}) {
  return (
    <${d}
      className={cn(
        'mt-5',
        divider && 'border-t border-atlas-border-dim/60 pt-5',
        className
      )}
    >
      {children}
    </${d}>
  );
}`;

if (!c.includes(oldBlock)) {
  console.error('CompactBlock not found');
  process.exit(1);
}
c = c.replace(oldBlock, newBlock);

const badOpen = '<' + 'motion.div key={key}>';
const goodOpen = '<' + d + ' key={key}>';
c = c.split(badOpen).join(goodOpen);

fs.writeFileSync(p, c);
console.log('patched');
