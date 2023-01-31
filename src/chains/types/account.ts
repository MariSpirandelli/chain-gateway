import { IChainClient } from './client';

export interface PrivateAccountInfo {
  accountId: string;
  privateKey: string;
  publicKey: string;
}

export abstract class IChainAccountService {
  protected _client: IChainClient;

  abstract create(): Promise<PrivateAccountInfo>;
  abstract getInfo(accountId: string): Promise<PrivateAccountInfo>;
  abstract getTreasuryAccount(): PrivateAccountInfo;
  abstract rotateKeys(accountId: string): Promise<PrivateAccountInfo>;
}
