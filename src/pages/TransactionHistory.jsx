import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          books:book_id (title, author)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (!startDate && !endDate) return true;
    
    const transactionDate = new Date(transaction.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      // Set end date to end of day for inclusive filtering
      end.setHours(23, 59, 59, 999);
      return transactionDate >= start && transactionDate <= end;
    }
    if (start) return transactionDate >= start;
    if (end) {
      end.setHours(23, 59, 59, 999);
      return transactionDate <= end;
    }
    return true;
  });

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <main className="flex-1 p-4 bg-creamwhite">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-coffeebrown mb-4">Transaction History</h2>

        {/* Date Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={handleClearFilter}
                className="text-sm text-red-600 hover:text-red-800 py-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.books?.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.books?.author}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                          transaction.type === 'buy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.type === 'buy' ? 'Purchase' : 'Rental'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.payment_method}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        ₱{transaction.total}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.discount_amount ? (
                          <span className="text-green-600">-₱{transaction.discount_amount}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₱{(transaction.total - (transaction.discount_amount || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
} 