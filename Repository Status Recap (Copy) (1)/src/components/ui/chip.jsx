export function Chip({ as: As = 'span', className = '', ...props }) {
  return <As className={`questit-chip ${className}`} {...props} />;
}


