import {
  AccountCreateTransaction,
  AccountInfoQuery,
  AccountUpdateTransaction,
  Client,
  Hbar,
  PrivateKey,
} from '@hashgraph/sdk';
import { IChainAccountService, PrivateAccountInfo } from '../types/account';
import config from '../../config';
import { IHederaClient } from './client';

export abstract class IHederaAccount extends IChainAccountService {}

export default class HederaAccount extends IHederaAccount {
  protected _client: IHederaClient;

  constructor(_client: IHederaClient) {
    super();
    this._client = _client;
  }

  private get client() {
    return this._client as any as Client;
  }

  async create(): Promise<PrivateAccountInfo> {
    const privateKey = await PrivateKey.generate();
    const { publicKey } = privateKey;

    const accountTransactionResponse = await new AccountCreateTransaction()
      .setKey(publicKey)
      .setInitialBalance(Hbar.fromTinybars(0))
      .execute(this.client);

    const getReceipt = await accountTransactionResponse.getReceipt(this.client);
    const { accountId } = getReceipt;

    return {
      accountId: accountId?.toString() || '',
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }

  async getInfo(accountId: string): Promise<PrivateAccountInfo> {
    const query = new AccountInfoQuery().setAccountId(accountId);

    const accountInfo = await query.execute(this.client);
    const publicKey = `${accountInfo.key}`;
    return { accountId, privateKey: '', publicKey };
  }

  getTreasuryAccount(): PrivateAccountInfo {
    return config.hedera.treasury;
  }

  async rotateKeys(accountId: string): Promise<PrivateAccountInfo> {
    const privateKey = await PrivateKey.generate();
    const { publicKey } = privateKey;

    const query = new AccountUpdateTransaction()
      .setAccountId(accountId)
      .setKey(publicKey)
      .freezeWith(this.client);

    const signTx = await (
      await query.sign(
        PrivateKey.fromString(this.getTreasuryAccount().privateKey)
      )
    ).sign(privateKey);
    await signTx.execute(this.client);

    return {
      accountId: accountId.toString(),
      privateKey: privateKey.toString(),
      publicKey: publicKey.toString(),
    };
  }
}
