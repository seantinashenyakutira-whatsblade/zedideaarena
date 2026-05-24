const { supabase } = require('../config/supabase');

const createWithdrawal = async (req, res) => {
  const { uid } = req.user;
  const {
    amount_cents,
    method,
    paypal_email,
    crypto_wallet_address,
    crypto_network,
    bank_account_name,
    bank_account_number,
    bank_name,
    bank_swift_code,
    bank_country,
  } = req.body;

  if (!amount_cents || amount_cents < 1000) {
    return res.status(400).json({ status: 'error', message: 'Minimum withdrawal is $10.00' });
  }

  if (!method || !['paypal', 'crypto', 'bank'].includes(method)) {
    return res.status(400).json({ status: 'error', message: 'Invalid withdrawal method' });
  }

  if (method === 'paypal' && !paypal_email) {
    return res.status(400).json({ status: 'error', message: 'PayPal email is required' });
  }

  if (method === 'crypto' && (!crypto_wallet_address || !crypto_network)) {
    return res.status(400).json({ status: 'error', message: 'Wallet address and network are required' });
  }

  if (method === 'bank' && (!bank_account_name || !bank_account_number || !bank_name)) {
    return res.status(400).json({ status: 'error', message: 'Bank account details are required' });
  }

  try {
    const { data: userRow } = await supabase
      .from('users')
      .select('is_verified')
      .eq('id', uid)
      .single();

    if (!userRow?.is_verified) {
      return res.status(403).json({ status: 'error', message: 'Account must be verified to withdraw' });
    }

    const withdrawalData = {
      user_id: uid,
      amount_cents,
      method,
      status: 'pending',
      ...(method === 'paypal' && { paypal_email }),
      ...(method === 'crypto' && { crypto_wallet_address, crypto_network }),
      ...(method === 'bank' && { bank_account_name, bank_account_number, bank_name, bank_swift_code, bank_country }),
    };

    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert(withdrawalData)
      .select()
      .single();

    if (error) throw error;

    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create withdrawal request' });
  }
};

const getWithdrawals = async (req, res) => {
  const { uid } = req.user;

  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ status: 'success', data: data || [] });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch withdrawal requests' });
  }
};

module.exports = { createWithdrawal, getWithdrawals };
