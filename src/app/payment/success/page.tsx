import { Suspense } from 'react';
import { PaymentSuccess } from '@/features/checkout';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}
