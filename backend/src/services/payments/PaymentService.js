const { supabase } = require('../../config/supabase');
const { v4: uuidv4 } = require('uuid');
const { notifyPaymentInline } = require('../../controllers/notificationController');

class PaymentService {
  constructor() {
    this._providers = new Map();
  }

  get isReady() {
    return this._providers.size > 0;
  }

  registerProvider(provider) {
    if (!provider.name) {
      throw new Error('PaymentProvider must have a name');
    }
    this._providers.set(provider.name, provider);
  }

  getProvider(name) {
    return this._providers.get(name);
  }

  getAvailableProviders() {
    return Array.from(this._providers.keys());
  }

  _resolveProvider(paymentMethod) {
    return this._providers.values().next().value || null;
  }

  async createPayment({ provider: providerName, paymentMethod, amount, currency, customer, metadata, description }) {
    const provider = providerName
      ? this._providers.get(providerName)
      : this._resolveProvider(paymentMethod);

    if (!provider) {
      return { success: false, error: `No provider available for method: ${paymentMethod || providerName}` };
    }

    const idempotencyKey = uuidv4();

    const result = await provider.createPayment({
      amount,
      currency,
      paymentMethod,
      customer,
      metadata,
      description,
      idempotencyKey,
    });

    if (!result.success) {
      return result;
    }

    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: metadata?.userId,
        competition_id: metadata?.competitionId,
        idea_id: metadata?.ideaId,
        type: metadata?.type || 'contestant',
        transaction_ref: result.transactionRef,
        amount_cents: amount,
        amount: (amount / 100).toFixed(2),
        status: 'pending',
        provider: provider.name,
        network_id: paymentMethod,
      });

    if (dbError) {
      console.error('PaymentService: failed to insert payment record:', dbError);
    }

    return result;
  }

  async verifyPayment({ transactionRef, sessionId, provider: providerName }) {
    if (sessionId && !transactionRef) {
      return { verified: false, payment: null };
    }

    if (transactionRef) {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_ref', transactionRef)
        .single();

      if (payment && payment.status === 'completed') {
        return { verified: true, payment };
      }

      if (providerName && payment) {
        const provider = this._providers.get(providerName);
        if (provider) {
          const verification = await provider.verifyPayment({ transactionRef });

          if (verification.success && verification.status === 'completed') {
            const updated = await this._completePaymentAndRunSideEffects({
              transactionRef,
              amount: verification.amount,
              provider: providerName,
            });
            return { verified: true, payment: updated };
          }

          return {
            verified: false,
            gateway_status: verification.status || 'pending',
          };
        }
      }

      return {
        verified: false,
        payment: payment || null,
      };
    }

    return { verified: false, payment: null };
  }

  async getPaymentStatusPoll({ transactionRef, provider: providerName }) {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .maybeSingle();

    if (payment && payment.status === 'completed') {
      return { status: 'completed', payment };
    }

    if (payment && (payment.status === 'failed' || payment.status === 'expired' || payment.status === 'cancelled')) {
      return { status: payment.status, payment };
    }

    if (providerName && (!payment || payment.status === 'pending')) {
      const provider = this._providers.get(providerName);
      if (provider) {
        const verification = await provider.verifyPayment({ transactionRef });

        if (verification.success) {
          if (verification.status === 'completed') {
            const updated = await this._completePaymentAndRunSideEffects({
              transactionRef,
              amount: verification.amount,
              provider: providerName,
            });
            return { status: 'completed', payment: updated };
          }

          return { status: verification.status, payment: null };
        }
      }
    }

    return { status: payment?.status || 'pending', payment: null };
  }

  async refundPayment({ transactionRef, amount, reason, provider: providerName }) {
    if (!transactionRef) {
      return { success: false, error: 'transactionRef is required' };
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    const provider = this._providers.get(payment.provider);
    if (!provider) {
      return { success: false, error: `Provider ${payment.provider} not available` };
    }

    const result = await provider.refundPayment({
      transactionRef,
      amount: amount || payment.amount_cents,
      reason,
    });

    if (result.success) {
      await supabase
        .from('payments')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('transaction_ref', transactionRef);
    }

    return result;
  }

  async getPaymentStatus({ transactionRef, provider: providerName }) {
    if (providerName) {
      const provider = this._providers.get(providerName);
      if (provider) {
        return provider.getPaymentStatus({ transactionRef });
      }
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .maybeSingle();

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    return { success: true, status: payment.status, payment };
  }

  async handleWebhook({ provider: providerName, payload, headers, rawBody }) {
    const provider = this._providers.get(providerName);
    if (!provider) {
      return { success: false, error: `Unknown provider: ${providerName}` };
    }

    const result = await provider.handleWebhook(payload, headers, rawBody);

    if (!result.success) {
      return result;
    }

    const processed = await this._processWebhookResult(result, rawBody || payload);

    return processed;
  }

  async _logWebhook({ provider, eventType, transactionRef, depositId, status, rawPayload, error }) {
    try {
      await supabase.from('payment_webhooks').insert({
        provider,
        event_type: eventType || status,
        transaction_ref: transactionRef,
        deposit_id: depositId,
        status,
        raw_payload: rawPayload ? JSON.parse(JSON.stringify(rawPayload)) : null,
        processed: !error,
        error_message: error || null,
      });
    } catch (err) {
      console.error('PaymentService: failed to log webhook:', err);
    }
  }

  async _recordAttempt({ paymentId, transactionRef, provider, amountCents, status, correspondent, customer, error, attemptNumber }) {
    try {
      await supabase.from('payment_attempts').insert({
        payment_id: paymentId,
        transaction_ref: transactionRef,
        provider: provider || 'pawapay',
        amount_cents: amountCents || 0,
        status: status || 'pending',
        correspondent: correspondent || null,
        customer_phone: customer?.phone || null,
        customer_email: customer?.email || null,
        error_message: error || null,
        attempt_number: attemptNumber || 1,
      });
    } catch (err) {
      console.error('PaymentService: failed to record attempt:', err);
    }
  }

  async _processWebhookResult(result, rawPayload) {
    const { event, transactionRef, status, amount, metadata } = result;

    await this._logWebhook({
      provider: 'pawapay',
      eventType: event,
      transactionRef,
      status,
      rawPayload,
    });

    if (!transactionRef) {
      return { success: false, error: 'No transactionRef in webhook result' };
    }

    if (status === 'completed') {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id, status')
        .eq('transaction_ref', transactionRef)
        .maybeSingle();

      if (existingPayment && existingPayment.status === 'completed') {
        return { success: true, message: 'Payment already processed' };
      }

      if (existingPayment) {
        await supabase
          .from('payments')
          .update({ status: 'completed' })
          .eq('transaction_ref', transactionRef);

        await this._recordAttempt({
          paymentId: existingPayment.id,
          transactionRef,
          amountCents: amount,
          status: 'completed',
          attemptNumber: 1,
        });
      }

      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_ref', transactionRef)
        .single();

      if (!payment) {
        return { success: false, error: 'Payment record not found' };
      }

      await this._runSideEffects(payment);

      return { success: true, payment };
    }

    if (status === 'failed' || status === 'expired' || status === 'cancelled') {
      await supabase
        .from('payments')
        .update({ status })
        .eq('transaction_ref', transactionRef);

      const { data: failedPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('transaction_ref', transactionRef)
        .single();

      if (failedPayment) {
        await this._recordAttempt({
          paymentId: failedPayment.id,
          transactionRef,
          status,
          error: `Webhook reported ${status}`,
          attemptNumber: 1,
        });
      }

      return { success: true, status };
    }

    return { success: true, status };
  }

  async _runSideEffects(payment) {
    const { user_id, competition_id, type, idea_id, amount_cents } = payment;

    try {
      if (type === 'contestant') {
        const ideaIdToUpdate = idea_id;

        if (ideaIdToUpdate) {
          const { data: idea } = await supabase
            .from('ideas')
            .select('status')
            .eq('id', ideaIdToUpdate)
            .single();

          const update = { payment_status: 'paid', updated_at: new Date().toISOString() };
          if (idea && idea.status === 'approved') {
            update.is_public = true;
          }

          await supabase.from('ideas').update(update).eq('id', ideaIdToUpdate);
        } else {
          const { data: ideas } = await supabase
            .from('ideas')
            .select('id, status')
            .eq('user_id', user_id)
            .eq('competition_id', competition_id)
            .eq('payment_status', 'unpaid')
            .limit(1);

          const idea = ideas && ideas.length > 0 ? ideas[0] : null;
          if (idea) {
            const update = { payment_status: 'paid', updated_at: new Date().toISOString() };
            if (idea.status === 'approved') {
              update.is_public = true;
            }
            await supabase.from('ideas').update(update).eq('id', idea.id);
          }
        }

        await supabase.rpc('increment_prize_pool', {
          comp_id: competition_id,
          amount: amount_cents,
        });
      } else if (type === 'voter') {
        const { data: userData } = await supabase
          .from('users')
          .select('voter_competitions_paid')
          .eq('id', user_id)
          .single();

        const currentPaid = userData?.voter_competitions_paid || [];
        if (!currentPaid.includes(competition_id)) {
          currentPaid.push(competition_id);
        }

        await supabase
          .from('users')
          .update({
            voter_payment_status: 'paid',
            voter_competitions_paid: currentPaid,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user_id);

        await supabase.rpc('increment_prize_pool', {
          comp_id: competition_id,
          amount: amount_cents,
        });
      }
    } catch (err) {
      console.error('PaymentService side effects error:', err);
    }
  }

  async _completePaymentAndRunSideEffects({ transactionRef, amount, provider }) {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) {
      return null;
    }

    await supabase
      .from('payments')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('transaction_ref', transactionRef);

    payment.status = 'completed';

    await this._runSideEffects(payment);

    return payment;
  }

  async getSupportedMethods(countryCode) {
    const allMethods = [];

    for (const provider of this._providers.values()) {
      const methods = await provider.getSupportedMethods(countryCode);
      if (methods && methods.length > 0) {
        allMethods.push({
          provider: provider.name,
          methods,
        });
      }
    }

    return allMethods;
  }
}

module.exports = PaymentService;
