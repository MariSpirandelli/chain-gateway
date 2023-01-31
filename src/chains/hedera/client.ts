import { AccountId, Client } from '@hashgraph/sdk';
import { IChainClient } from '../types/client';
import config from '../../config';

const isMainnet = process.env.HEDERA_NET === 'mainnet';

const sdkNetwork = {
  '35.237.200.180:50211': new AccountId(3),
  // "35.186.191.247:50211": new AccountId(4),
  '35.192.2.25:50211': new AccountId(5),
  '35.199.161.108:50211': new AccountId(6),
  // "35.203.82.240:50211": new AccountId(7),
  '35.236.5.219:50211': new AccountId(8),
  '35.197.192.225:50211': new AccountId(9),
  // "35.242.233.154:50211": new AccountId(10),
  '35.240.118.96:50211': new AccountId(11),
  '35.204.86.32:50211': new AccountId(12),
  '35.234.132.107:50211': new AccountId(13),
  '35.236.2.27:50211': new AccountId(14),
  '35.228.11.53:50211': new AccountId(15),
  '34.91.181.183:50211': new AccountId(16),
  '34.86.212.247:50211': new AccountId(17),
  '172.105.247.67:50211': new AccountId(18),
  '34.89.87.138:50211': new AccountId(19),
  '34.82.78.255:50211': new AccountId(20),
  '34.76.140.109:50211': new AccountId(21),
  '34.64.141.166:50211': new AccountId(22),
  '35.232.244.145:50211': new AccountId(23),
  '34.89.103.38:50211': new AccountId(24),
  '34.93.112.7:50211': new AccountId(25),
};

export interface IHederaClient extends IChainClient {}

class HederaClient implements IHederaClient {
  private _client: Client;

  constructor() {
    this.connect();
  }

  connect() {
    this._client = isMainnet
      ? Client.forNetwork(sdkNetwork)
      : Client.forTestnet();
    this._client.setOperator(
      config.hedera.treasury.accountId,
      config.hedera.treasury.accountId
    );
  }

  get client() {
    return this._client;
  }
}

const hederaClient = new HederaClient();
// singleton - doesn't need to connect each time
export default hederaClient;
