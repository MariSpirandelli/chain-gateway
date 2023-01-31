import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: `${__dirname}/../../${process.env.NODE_ENV}.env` });

const env = process.env.NODE_ENV || 'development';

const hedera = {
  net: process.env.HEDERA_NET || 'testnet',
  accountId: process.env.HEDERA_ACCOUNT_ID || '',
  restEndpoint: process.env.HEDERA_REST_ENDPOINT,
  restEndpointVersion: process.env.HEDERA_REST_ENDPOINT_COMMON_PATH,
  publicKey: process.env.HEDERA_PUBLIC_KEY,
  privateKey: process.env.HEDERA_PRIVATE_KEY,
  treasury: {
    accountId: process.env.HEDERA_TREASURY_ACCOUNT_ID || '',
    publicKey: process.env.HEDERA_TREASURY_PUBLIC_KEY || '',
    privateKey: process.env.HEDERA_TREASURY_PRIVATE_KEY || '',
  },
};

const port = +(process.env.PORT || 3000);

export default {
  env,
  hedera,
  port,
};
