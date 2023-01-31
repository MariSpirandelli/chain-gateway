import { IBaseChain } from '../baseChain';
import HederaAccount, { IHederaAccount } from './account';
import hederaClient, { IHederaClient } from './client';
import HederaFile, { IHederaFile } from './file';
import HederaToken, { IHederaToken } from './token';

export default class Hedera implements IBaseChain {
  _client: IHederaClient;

  accountService: IHederaAccount;
  tokenService: IHederaToken;
  fileService: IHederaFile;

  constructor() {
    this._client = hederaClient;
    this.accountService = new HederaAccount(this._client);
    this.fileService = new HederaFile(this._client, this.accountService);
    this.tokenService = new HederaToken(this._client, this.accountService);
  }

  protected get client() {
    return this.client;
  }
}
