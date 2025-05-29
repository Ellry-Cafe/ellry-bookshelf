import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percentage: '',
    expiry_date: '',
    is_active: true
  });

  useEffect(() => {
    checkAndCreateTable();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAndCreateTable = async () => {
    try {
      // First, try to create the table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_coupons_table');
      
      if (createError) {
        console.error('Error checking/creating table:', createError);
      }
      
      // Proceed to fetch coupons
      fetchCoupons();
    } catch (error) {
      console.error('Error in table setup:', error);
      toast.error('Failed to initialize coupons system');
    }
  };

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') { // Table doesn't exist error
          toast.error('Coupons system not initialized. Please contact administrator.');
          return;
        }
        throw error;
      }
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newCoupon.code || !newCoupon.discount_percentage || !newCoupon.expiry_date) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { error } = await supabase
        .from('coupons')
        .insert([{
          code: newCoupon.code.toUpperCase(),
          discount_percentage: parseFloat(newCoupon.discount_percentage),
          expiry_date: newCoupon.expiry_date,
          is_active: newCoupon.is_active
        }]);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast.error('This coupon code already exists');
          return;
        }
        throw error;
      }

      toast.success('Coupon created successfully!');
      fetchCoupons();
      setNewCoupon({
        code: '',
        discount_percentage: '',
        expiry_date: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast.error('Failed to create coupon');
    }
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast.error('Failed to update coupon');
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="p-4 bg-creamwhite min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-coffeebrown mb-6">Coupon Management</h1>

        {/* Create Coupon Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Coupon Code"
                className="p-2 border rounded text-sm"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Discount Percentage"
                className="p-2 border rounded text-sm"
                value={newCoupon.discount_percentage}
                onChange={(e) => setNewCoupon({ ...newCoupon, discount_percentage: e.target.value })}
                min="0"
                max="100"
                required
              />
              <input
                type="date"
                className="p-2 border rounded text-sm"
                value={newCoupon.expiry_date}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                required
              />
              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newCoupon.is_active}
                    onChange={(e) => setNewCoupon({ ...newCoupon, is_active: e.target.checked })}
                    className="form-checkbox"
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="bg-tealbrand text-white px-4 py-2 rounded text-sm hover:bg-opacity-90"
            >
              Create Coupon
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-4 text-sm">{coupon.code}</td>
                    <td className="px-6 py-4 text-sm">{coupon.discount_percentage}%</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(coupon.expiry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          coupon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {coupon.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 