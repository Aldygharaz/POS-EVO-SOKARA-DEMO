import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useFormat } from '@/hooks/useFormat';
import { Search } from 'lucide-react';

export default function AuditPage() {
  const { auditLogs } = useStore();
  const { formatDate } = useFormat();

  const [filter, setFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (filter && !log.action.toLowerCase().includes(filter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.userName?.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q);
    }
    return true;
  });

  const actionColors: Record<string, string> = {
    LOGIN: 'pos-badge-blue',
    LOGOUT: 'pos-badge-blue',
    CREATE_PRODUCT: 'pos-badge-green',
    UPDATE_PRODUCT: 'pos-badge-amber',
    DELETE_PRODUCT: 'pos-badge-red',
    TRANSACTION_COMPLETE: 'pos-badge-green',
    VOID_TRANSACTION: 'pos-badge-red',
    STOCK_IN: 'pos-badge-green',
    STOCK_OUT: 'pos-badge-red',
    UPDATE_SETTINGS: 'pos-badge-amber',
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Audit Log</h2>
        <p className="text-sm text-gray-500 mt-0.5">Riwayat aktivitas sistem</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Cari audit log..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pos-input w-full pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'STOCK', 'TRANSACTION'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20'
                  : 'bg-[#111111] text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {f || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="pos-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-[#111111]">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Waktu</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Aksi</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Entitas</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">User</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} className="pos-table-row">
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`${actionColors[log.action] || 'pos-badge-blue'} text-[10px]`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.entityType}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#00FF41]/10 flex items-center justify-center">
                        <span className="text-[9px] font-semibold text-[#00FF41]">{log.userName?.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-white">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                    {log.reason || (log.newValue ? log.newValue.slice(0, 50) : '-')}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada log</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
