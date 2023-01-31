import { PrivateAccountInfo } from './account';
import { AssociateType, CreateNftType } from './nft';

export interface IChainTokenService {
  associate(data: AssociateType);
  burnTokenSerialNumbers(
    tokenid: string,
    serialNumbers: number | number[],
    fromAccountInfo: PrivateAccountInfo
  );

  createNft(nftData: CreateNftType);
  getAvailableByAccountId(
    tokenId: string,
    accountId: string,
    quantity?: number,
    last?: number
  ): Promise<number[]>;
  getInfo(tokenId: string);
  hasBalance(accountId: string, tokenId);
  mintNft(
    tokenId: string,
    quantity: number,
    metadata: string
  ): Promise<any[][]>;
  swapNfts(
    fromTokenId: string,
    toTokenId: string,
    fromAccount: PrivateAccountInfo,
    toAccount: PrivateAccountInfo,
    fromSerialNumbers: number[],
    toSerialNumbers: number[]
  );
  transferTokenOwnership(
    toAccount: PrivateAccountInfo,
    fromAccount: PrivateAccountInfo,
    tokenId: string,
    serialNumbers: number[]
  ): Promise<any>;
}
