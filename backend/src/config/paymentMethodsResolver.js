const COUNTRY_METHODS = {
  ZM: [
    { id: 'mtn-zm', name: 'MTN Mobile Money', icon: 'mtn', provider: 'pawapay', networks: ['mtn'] },
    { id: 'airtel-zm', name: 'Airtel Money', icon: 'airtel', provider: 'pawapay', networks: ['airtel'] },
  ],
  TZ: [
    { id: 'm-pesa-tz', name: 'M-Pesa', icon: 'mpesa', provider: 'pawapay', networks: ['vodacom'] },
    { id: 'airtel-tz', name: 'Airtel Money', icon: 'airtel', provider: 'pawapay', networks: ['airtel'] },
    { id: 'tigo-tz', name: 'Tigo Pesa', icon: 'tigo', provider: 'pawapay', networks: ['tigo'] },
  ],
  UG: [
    { id: 'mtn-ug', name: 'MTN Mobile Money', icon: 'mtn', provider: 'pawapay', networks: ['mtn'] },
    { id: 'airtel-ug', name: 'Airtel Money', icon: 'airtel', provider: 'pawapay', networks: ['airtel'] },
  ],
};

const CARD_METHODS = [
  { id: 'card', name: 'Visa / Mastercard', icon: 'card', provider: 'pawapay', networks: ['visa', 'mastercard'] },
];

function getAllowedMethods(countryCode) {
  if (!countryCode) {
    return CARD_METHODS;
  }

  const countryKey = countryCode.toUpperCase();
  const countrySpecific = COUNTRY_METHODS[countryKey] || [];
  const mobileMethods = countrySpecific.filter(m => m.id !== 'card');
  const cardMethods = CARD_METHODS;

  return { mobile: mobileMethods, card: cardMethods };
}

const CORRESPONDENT_MAP = {
  'mtn-zm': 'MTN_ZMB',
  'airtel-zm': 'AIRTEL_ZMB',
  'mtn-ug': 'MTN_UGA',
  'airtel-ug': 'AIRTEL_UGA',
  'm-pesa-tz': 'MPESA_TZA',
  'airtel-tz': 'AIRTEL_TZA',
  'tigo-tz': 'TIGO_TZA',
  'card': 'CARD',
};

function getCorrespondent(methodId) {
  return CORRESPONDENT_MAP[methodId] || null;
}

function getSupportedCountries() {
  return Object.keys(COUNTRY_METHODS);
}

module.exports = {
  COUNTRY_METHODS,
  CARD_METHODS,
  getAllowedMethods,
  CORRESPONDENT_MAP,
  getCorrespondent,
  getSupportedCountries,
};
