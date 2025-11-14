export function Section({ className = '', ...props }) {
  return <section className={`questit-section ${className}`} {...props} />;
}

export function SectionTight({ className = '', ...props }) {
  return <section className={`questit-section--tight ${className}`} {...props} />;
}


