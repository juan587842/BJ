import { PackageOpen, Search, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'package' | 'search' | 'alert';
  action?: React.ReactNode;
}

export default function EmptyState({
  title = 'Nenhum item encontrado',
  description = 'Tente ajustar os filtros ou termos de busca.',
  icon = 'package',
  action,
}: EmptyStateProps) {
  const icons = {
    package: <PackageOpen className="w-12 h-12 text-slate-300 dark:text-slate-600" />,
    search: <Search className="w-12 h-12 text-slate-300 dark:text-slate-600" />,
    alert: <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4">{icons[icon]}</div>
      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 text-center max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
