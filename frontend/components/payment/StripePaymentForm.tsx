'use client'

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: (paymentIntent: any) => void;
}

export function StripePaymentForm({ clientSecret, onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) return;

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'An error occurred with Stripe');
      setLoading(false);
    } else {
      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setLoading(false);
        setTimeout(() => onSuccess(paymentIntent), 1500);
      }
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8 animate-zed-fade-up">
        <div className="w-16 h-16 bg-zed-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-zed-success" />
        </div>
        <h3 className="text-xl font-bold text-zed-foreground mb-2">Payment Successful!</h3>
        <p className="text-zed-foreground-secondary">Your participation is confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-zed-surface border border-zed-border rounded-zed-lg">
        <label className="block text-sm font-medium text-zed-foreground mb-4">Card Details</label>
        <div className="p-3 bg-zed-background border border-zed-border rounded-zed-md">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#ffffff',
                  '::placeholder': { color: '#9ca3af' },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-zed-lg flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-lg font-bold disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock size={20} /> Pay Join Arena</>}
      </button>
    </form>
  );
}
