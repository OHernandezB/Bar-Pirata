export function formatCLP(value) {
  try {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  } catch (e) {
    return `$${Number(value || 0).toLocaleString('es-CL')}`;
  }
}