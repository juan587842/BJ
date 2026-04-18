interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
}

export default function StatusBadge({ variant, children }: StatusBadgeProps) {
  const classes = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  };

  return (
    <span className={`badge ${classes[variant]}`}>
      {children}
    </span>
  );
}
