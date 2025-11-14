export function Surface({ as: As = 'div', className = '', ...props }) {
  return <As className={`questit-surface ${className}`} {...props} />;
}

export function SurfaceMuted({ as: As = 'div', className = '', ...props }) {
  return <As className={`questit-surface-muted ${className}`} {...props} />;
}


