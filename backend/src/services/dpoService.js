const https = require('https');

const DPO_API_URL = process.env.DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/';
const DPO_COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN || '';
const DPO_SERVICE_TYPE = process.env.DPO_SERVICE_TYPE || '';

function buildCreatePaymentXml({
  companyToken,
  serviceType,
  amount,
  countryCode,
  customerEmail,
  customerName,
  customerPhone,
  orderId,
  paymentType,
  competitionId,
  networkId,
}) {
  const paymentCurrency = countryCode === 'ZMW' ? 'ZMW' : countryCode === 'MWK' ? 'MWK' : 'USD';
  const companyRef = `${paymentType}_${competitionId}_${orderId}`;

  return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${companyToken}</CompanyToken>
  <Request>createPaymentSession</Request>
  <Transaction>
    <PaymentAmount>${amount}</PaymentAmount>
    <PaymentCurrency>${paymentCurrency}</PaymentCurrency>
    <CompanyRef>${companyRef}</CompanyRef>
    <RedirectURL>${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/success?network=${networkId}&competitionId=${competitionId}&type=${paymentType}</RedirectURL>
    <BackURL>${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment/error?competitionId=${competitionId}&type=${paymentType}&reason=cancelled</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>5</PTL>
    <PTLtype>minute</PTLtype>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${serviceType || DPO_SERVICE_TYPE}</ServiceType>
      <ServiceDescription>${paymentType === 'voter' ? 'Voter Registration' : 'Competition Entry'} - ${competitionId}</ServiceDescription>
      <ServiceDate>${new Date().toISOString().split('T')[0]}</ServiceDate>
    </Service>
  </Services>
</API3G>`;
}

function buildVerifyPaymentXml({ companyToken, transactionToken }) {
  return `<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <CompanyToken>${companyToken}</CompanyToken>
  <Request>verifyPayment</Request>
  <TransactionToken>${transactionToken}</TransactionToken>
</API3G>`;
}

function parseXmlResponse(xml) {
  const result = {};
  const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
  let match;
  while ((match = tagRegex.exec(xml)) !== null) {
    result[match[1]] = match[2];
  }
  return result;
}

function httpsPost(url, xmlBody) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const data = Buffer.from(xmlBody, 'utf-8');

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`DPO HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function createPaymentSession({
  amount,
  countryCode,
  networkId,
  customerEmail,
  customerName,
  customerPhone,
  orderId,
  paymentType,
  competitionId,
}) {
  if (!DPO_COMPANY_TOKEN) {
    return { success: false, error: 'DPO not configured' };
  }

  try {
    const xml = buildCreatePaymentXml({
      companyToken: DPO_COMPANY_TOKEN,
      serviceType: DPO_SERVICE_TYPE,
      amount,
      countryCode,
      networkId,
      customerEmail,
      customerName,
      customerPhone,
      orderId,
      paymentType,
      competitionId,
    });

    const responseXml = await httpsPost(DPO_API_URL, xml);
    const parsed = parseXmlResponse(responseXml);

    if (parsed.Result === '000') {
      return {
        success: true,
        transactionRef: parsed.TransactionToken,
        checkoutUrl: parsed.TransRedirectURL,
      };
    }

    return { success: false, error: parsed.ResultExplanation || 'DPO payment creation failed' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function verifyPayment(transactionToken) {
  if (!DPO_COMPANY_TOKEN) {
    return { success: false, error: 'DPO not configured' };
  }

  try {
    const xml = buildVerifyPaymentXml({
      companyToken: DPO_COMPANY_TOKEN,
      transactionToken,
    });

    const responseXml = await httpsPost(DPO_API_URL, xml);
    const parsed = parseXmlResponse(responseXml);

    if (parsed.Result === '000') {
      return {
        success: true,
        status: parsed.TransactionStatus || 'unknown',
        amount: parsed.TransactionAmount,
        currency: parsed.TransactionCurrency,
        customerRef: parsed.CustomerRef,
      };
    }

    return { success: false, error: parsed.ResultExplanation || 'DPO verification failed' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { createPaymentSession, verifyPayment };
