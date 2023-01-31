import { IBaseChain } from './baseChain';

export default class Chain<T extends IBaseChain> {
  private _network: T;

  constructor(network: T) {
    this._network = network;
  }

  get account() {
    return this._network.accountService;
  }

  get file() {
    return this._network.fileService;
  }

  get token() {
    return this._network.tokenService;
  }
}
