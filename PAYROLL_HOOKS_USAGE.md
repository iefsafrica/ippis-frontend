/**
 * Example: How to use Payroll Hooks in Components
 * 
 * This file demonstrates how to integrate the React Query payroll hooks
 * into your components for managing payment data.
 */

// ============================================================================
// 1. FETCHING PAYMENTS (GET Request)
// ============================================================================

import { useGetPayments } from '@/services/hooks/payroll';

export function PaymentListExample() {
  const { data, isLoading, error, isError } = useGetPayments();

  if (isLoading) return <div>Loading payments...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  const payments = data?.data?.payrolls || [];

  return (
    <div>
      <h1>Payment History</h1>
      <table>
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Employee ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td>{payment.payment_id}</td>
              <td>{payment.employee_id}</td>
              <td>{payment.amount}</td>
              <td>{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// 2. CREATING A PAYMENT (POST Request)
// ============================================================================

import { useCreatePayment } from '@/services/hooks/payroll';
import { PaymentData } from '@/types/payroll';

export function CreatePaymentExample() {
  const createPayment = useCreatePayment();

  const handleCreatePayment = async () => {
    const newPayment: PaymentData = {
      employee_id: 'EMP10564',
      amount: 1500,
      payment_date: '2026-03-31',
      payment_type: 'salary',
      status: 'pending',
    };

    try {
      // This will automatically:
      // - Make the API request
      // - Show success toast on completion
      // - Invalidate and refetch payment list
      await createPayment.mutateAsync(newPayment);
    } catch (error) {
      console.error('Payment creation failed:', error);
    }
  };

  return (
    <button 
      onClick={handleCreatePayment}
      disabled={createPayment.isPending}
    >
      {createPayment.isPending ? 'Processing...' : 'Create Payment'}
    </button>
  );
}

// ============================================================================
// 3. UPDATING A PAYMENT (PUT Request)
// ============================================================================

import { useUpdatePayment } from '@/services/hooks/payroll';
import { PaymentData } from '@/types/payroll';

export function UpdatePaymentExample() {
  const updatePayment = useUpdatePayment();

  const handleUpdatePayment = async () => {
    const updatedData: Partial<PaymentData> = {
      status: 'paid',
      amount: 2000,
    };

    try {
      // Update payment and automatically refetch list
      await updatePayment.mutateAsync(updatedData);
    } catch (error) {
      console.error('Payment update failed:', error);
    }
  };

  return (
    <button 
      onClick={handleUpdatePayment}
      disabled={updatePayment.isPending}
    >
      {updatePayment.isPending ? 'Updating...' : 'Update Payment'}
    </button>
  );
}

// ============================================================================
// 4. DELETING A PAYMENT (DELETE Request)
// ============================================================================

import { useDeletePayment } from '@/services/hooks/payroll';

export function DeletePaymentExample() {
  const deletePayment = useDeletePayment();

  const handleDeletePayment = async (paymentId: number) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        // Delete payment and automatically refetch list
        await deletePayment.mutateAsync(paymentId);
      } catch (error) {
        console.error('Payment deletion failed:', error);
      }
    }
  };

  return (
    <button 
      onClick={() => handleDeletePayment(1)}
      disabled={deletePayment.isPending}
    >
      {deletePayment.isPending ? 'Deleting...' : 'Delete Payment'}
    </button>
  );
}

// ============================================================================
// 5. COMPLETE CRUD EXAMPLE
// ============================================================================

export function PaymentManagementExample() {
  const { data, isLoading } = useGetPayments();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const payments = data?.data?.payrolls || [];

  return (
    <div>
      <h1>Payment Management</h1>

      {/* Create Section */}
      <section>
        <h2>Create New Payment</h2>
        <button 
          onClick={() => createPayment.mutateAsync({
            employee_id: 'EMP10001',
            amount: 5000,
            payment_date: new Date().toISOString().split('T')[0],
            payment_type: 'salary',
          })}
        >
          Add Payment
        </button>
      </section>

      {/* List Section */}
      <section>
        <h2>All Payments ({payments.length})</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Employee</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.payment_id}</td>
                  <td>{payment.employee_id}</td>
                  <td>${payment.amount}</td>
                  <td>{payment.payment_type}</td>
                  <td>{payment.status}</td>
                  <td>
                    <button 
                      onClick={() => deletePayment.mutateAsync(payment.id)}
                      disabled={deletePayment.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// ============================================================================
// KEY FEATURES
// ============================================================================

/**
 * ✅ Automatic Success/Error Toasts
 *    - Created via useSafeMutation integration
 *    - Customizable messages
 * 
 * ✅ Automatic Query Invalidation
 *    - After any mutation, the payment list is automatically refetched
 * 
 * ✅ Loading & Error States
 *    - isPending: for mutation loading state
 *    - isLoading: for query loading state
 *    - error: error object with details
 * 
 * ✅ Type Safety
 *    - Full TypeScript support for all data types
 *    - PaymentData, PaymentResponse interfaces included
 * 
 * ✅ Centralized Configuration
 *    - Endpoints defined in: services/constants/payroll/index.ts
 *    - Query keys defined in: services/constants/payroll/index.ts
 *    - Types defined in: types/payroll/index.ts
 */
