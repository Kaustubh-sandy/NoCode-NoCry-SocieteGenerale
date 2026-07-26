'use client';

import React, { useState, useEffect, useMemo } from 'react';

// --- SVG Icons ---
const SearchIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowUpDownIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
  </svg>
);

const ChevronUpIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ShieldIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ZapIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const AlertCircleIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BriefcaseIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const StarIcon = ({ className = "w-3 h-3" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

interface CustomerBrowserProps {
  onSelectCustomer: (customer: any) => void;
}

export default function CustomerBrowser({ onSelectCustomer }: CustomerBrowserProps) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  
  const [search, setSearch] = useState('');
  const [filterSegment, setFilterSegment] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const segments = ['ALL', 'Premium Investors', 'Emerging Affluent', 'Everyday Banking', 'Dormant Recovery'];

  useEffect(() => {
    fetchCustomers(page);
  }, [page]);

  const fetchCustomers = async (pageIndex: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/customers?limit=${limit}&offset=${pageIndex * limit}`);
      if (response.ok) {
        const json = await response.json();
        setData(json.customers || []);
        setTotal(json.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatCurrency = (value: number) => {
    if (value == null) return '-';
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(2)} k`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const getCreditScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 650) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const getSegmentConfig = (segment: string) => {
    switch (segment) {
      case 'Premium Investors':
        return { color: 'text-purple-400 bg-purple-400/10 border-purple-400/20', icon: <StarIcon className="w-3 h-3 mr-1" /> };
      case 'Emerging Affluent':
        return { color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', icon: <ZapIcon className="w-3 h-3 mr-1" /> };
      case 'Everyday Banking':
        return { color: 'text-slate-300 bg-slate-500/10 border-slate-500/20', icon: <BriefcaseIcon className="w-3 h-3 mr-1" /> };
      case 'Dormant Recovery':
        return { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: <AlertCircleIcon className="w-3 h-3 mr-1" /> };
      default:
        return { color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: <ShieldIcon className="w-3 h-3 mr-1" /> };
    }
  };

  const processedData = useMemo(() => {
    let filtered = [...data];

    if (filterSegment !== 'ALL') {
      filtered = filtered.filter(item => item.segment_label === filterSegment);
    }
    
    if (search.trim() !== '') {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(item => 
        (item.customer_id && String(item.customer_id).toLowerCase().includes(lowerSearch)) ||
        (item.city && String(item.city).toLowerCase().includes(lowerSearch))
      );
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, search, filterSegment, sortConfig]);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return <ArrowUpDownIcon className="w-3 h-3 ml-1 inline opacity-40 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUpIcon className="w-3 h-3 ml-1 inline text-rose-500" />
      : <ChevronDownIcon className="w-3 h-3 ml-1 inline text-rose-500" />;
  };

  const startRange = page * limit + 1;
  const endRange = Math.min((page + 1) * limit, total);

  return (
    <div className="w-full h-full flex flex-col gap-4 bg-[#0b0f19] text-slate-200 p-6 rounded-2xl border border-slate-800/60 shadow-2xl backdrop-blur-md">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Segment Filters */}
        <div className="flex flex-wrap gap-2">
          {segments.map((segment) => (
            <button
              key={segment}
              onClick={() => setFilterSegment(segment)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border ${
                filterSegment === segment 
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {segment}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-rose-500 transition-colors">
            <SearchIcon className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search ID or City..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-slate-900/80 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all font-mono"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800 sticky top-0 z-10">
              <tr>
                {[
                  { key: 'customer_id', label: 'Customer ID' },
                  { key: 'city', label: 'City' },
                  { key: 'segment_label', label: 'Segment' },
                  { key: 'yearly_income', label: 'Income' },
                  { key: 'net_worth_estimate', label: 'Net Worth' },
                  { key: 'credit_score', label: 'Credit Score' },
                  { key: 'premium_potential', label: 'Premium Potential' },
                  { key: 'activity_score', label: 'Activity Score' }
                ].map((col) => (
                  <th 
                    key={col.key}
                    className="py-4 px-6 font-semibold cursor-pointer group hover:text-slate-200 transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label} {renderSortIcon(col.key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {Array.from({ length: 8 }).map((_, cIdx) => (
                      <td key={cIdx} className="py-4 px-6">
                        <div className="h-4 bg-slate-800/80 rounded w-full max-w-[100px]"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : processedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No customers found matching the current filters.
                  </td>
                </tr>
              ) : (
                processedData.map((customer) => {
                  const segmentConfig = getSegmentConfig(customer.segment_label);
                  const creditScoreColor = getCreditScoreColor(customer.credit_score);
                  const potential = customer.premium_potential || 0;
                  const potentialPercent = potential <= 1 ? potential * 100 : potential;
                  
                  return (
                    <tr 
                      key={customer.customer_id}
                      onClick={() => onSelectCustomer(customer)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-6 font-mono text-indigo-300 group-hover:text-indigo-200">#{customer.customer_id}</td>
                      <td className="py-3 px-6 font-medium text-slate-300">{customer.city || '-'}</td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border ${segmentConfig.color}`}>
                          {segmentConfig.icon}
                          {customer.segment_label || 'Unassigned'}
                        </span>
                      </td>
                      <td className="py-3 px-6 font-mono text-slate-300">{formatCurrency(customer.yearly_income)}</td>
                      <td className="py-3 px-6 font-mono text-slate-300">{formatCurrency(customer.net_worth_estimate || customer.net_worth)}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded font-mono text-xs font-bold border ${creditScoreColor}`}>
                          {customer.credit_score || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs w-8 text-right text-slate-400">{Math.round(potentialPercent)}%</span>
                          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full transition-all duration-500"
                              style={{ width: `${potentialPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6 font-mono text-slate-300">
                        {customer.activity_score != null ? Number(customer.activity_score).toFixed(1) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="flex items-center justify-between text-sm pt-2">
        <div className="text-slate-400 font-mono">
          Showing <span className="text-slate-200 font-semibold">{total === 0 ? 0 : startRange}</span> - <span className="text-slate-200 font-semibold">{endRange}</span> of <span className="text-slate-200 font-semibold">{total.toLocaleString('en-IN')}</span> customers
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          <span className="px-4 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300">
            Page {page + 1}
          </span>
          
          <button 
            onClick={() => setPage(p => p + 1)}
            disabled={endRange >= total || loading}
            className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
