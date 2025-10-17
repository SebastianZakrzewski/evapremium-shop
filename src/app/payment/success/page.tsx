import { Suspense } from 'react';
import { PaymentSuccess } from '@/components/payment-success';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
