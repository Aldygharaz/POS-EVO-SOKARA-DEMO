export function useFormat() {
  const formatRupiah = (value: number, showSymbol = true): string => {
    const formatted = new Intl.NumberFormat('id-ID').format(value);
    return showSymbol ? `Rp${formatted}` : formatted;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateStr: string): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const generateInvoiceNumber = (prefix: string): string => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `${prefix}-${dateStr}-${random}`;
  };

  const generateId = (prefix: string): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  };

  return { formatRupiah, formatDate, formatDateOnly, formatNumber, generateInvoiceNumber, generateId };
}
