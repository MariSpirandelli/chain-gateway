import { BaseChain } from './baseChain';

export default class Chain<T extends BaseChain> {
  private _network: T;

  constructor(network: T) {
    this._network = network;
  }

  get accountService() {
    return this._network.accountService;
  }

  get fileService() {
    return this._network.fileService;
  }

  get tokenService() {
    return this._network.tokenService;
  }
}
