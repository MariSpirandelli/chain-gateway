import Chain from '.';
import { InternalError } from '../express/errors';
import { AvailableChains } from '../types/chain';
import Hedera from './hedera';

export default class ChainFactory {
  static getChainByNetwork(network: AvailableChains) {
    switch (network) {
      case 'hedera':
        return new Chain<Hedera>(new Hedera());
      default:
        throw new InternalError(`Chain not found`);
    }
  }
}
