var config = {
  server: {
    port: 3000
  },
  mongodb: {
    address: 'localhost',
    nsp: 'soixantephotos'
  },
  mail: {
    verifyMail: 'YOUR_VERIFY_MAIL',
    verifyName: 'YOUR_VERIFIER_NAME',
    sender: 'YOUR_SENDER_MAIL',
    senderName: 'YOUR_SENDER_MAIL',
    mandrill: {
      apiKey: 'YOUR_API_KEY'
    },
  }
};

module.exports = config;