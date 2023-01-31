import {
  Client,
  PrivateKey,
  TokenAssociateTransaction,
  TokenBurnTransaction,
  TokenCreateTransaction,
  TokenMintTransaction,
  TokenSupplyType,
  TokenType,
  TransferTransaction,
} from '@hashgraph/sdk';
import axios from 'axios';
import bunyan from 'bunyan';
import { PrivateAccountInfo } from '../types/account';
import { AssociateType, CreateNftType } from '../types/nft';
import { IChainTokenService } from '../types/tokenService';
import config from '../../config';
import { retryIf } from '../../helpers/retry-if';
import { IHederaClient } from './client';
import { getPaginated } from './helpers';
import { IHederaAccount } from './account';

const logger = bunyan.createLogger({ name: 'chains::supplier::hedera::token' });

export interface IHederaToken extends IChainTokenService {}

export default class HederaToken implements IHederaToken {
  protected _client: IHederaClient;
  protected _account: IHederaAccount;

  constructor(_client: IHederaClient, account: IHederaAccount) {
    this._client = _client;
    this._account = account;
  }
  private get client() {
    return this.client as any as Client;
  }

  async associate(data: AssociateType) {
    const {
      tokenIds,
      destinationAccountId,
      destinationAccountPrivateKey,
      memo,
    } = data;
    const privateKey = PrivateKey.fromString(destinationAccountPrivateKey);

    const transaction = await new TokenAssociateTransaction()
      .setAccountId(destinationAccountId)
      .setTokenIds(tokenIds)
      .setTransactionMemo(memo || '')
      .freezeWith(this.client);

    const signTx = await transaction.sign(privateKey);
    const txResponse = await signTx.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return receipt;
  }

  async burnTokenSerialNumbers(
    tokenId: string,
    serialNumbers: number | number[],
    fromAccountInfo: PrivateAccountInfo
  ) {
    if (typeof serialNumbers === 'number') {
      serialNumbers = [serialNumbers];
    }

    if (!serialNumbers.length) {
      return;
    }

    logger.info(
      `[burnTokenSerialNumbers] - transfer serial numbers to treasury account before burning them`,
      {
        tokenId,
        serialNumbers,
        walletId: fromAccountInfo.accountId,
      }
    );

    const treasuryAccount = this._account.getTreasuryAccount();
    await retryIf(
      () =>
        this.transferTokenOwnership(
          treasuryAccount,
          fromAccountInfo,
          tokenId,
          serialNumbers as number[]
        ),
      (err) => err.statusCode === 429,
      10,
      2 * 1000
    );

    logger.info(`[burnTokenSerialNumbers] - start burning serial numbers`);

    const transaction = await new TokenBurnTransaction({
      tokenId,
      serials: serialNumbers,
    });
    transaction.freezeWith(this.client);

    const privateKey = PrivateKey.fromString(fromAccountInfo.privateKey);
    const signTx = await transaction.sign(privateKey);
    const txResponse = await signTx.execute(this.client);

    return txResponse.getReceipt(this.client);
  }

  async createNft(nftData: CreateNftType) {
    const { name, symbol, maxSupply, memo } = nftData;
    const operatorPrivateKey = PrivateKey.fromString(
      config.hedera.treasury.privateKey
    );
    const treasuryPrivateKey = PrivateKey.fromString(
      config.hedera.treasury.privateKey
    );

    const transaction = new TokenCreateTransaction()
      .setTokenType(TokenType.NonFungibleUnique)
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenMemo(memo || '')
      .setTreasuryAccountId(this._account.getTreasuryAccount().accountId)
      .setSupplyKey(operatorPrivateKey)
      .setAdminKey(operatorPrivateKey)
      .setFeeScheduleKey(operatorPrivateKey)
      .setInitialSupply(0)
      .setDecimals(0);

    if (maxSupply && maxSupply > 0) {
      transaction.setMaxSupply(maxSupply).setSupplyType(TokenSupplyType.Finite);
    } else {
      transaction.setSupplyType(TokenSupplyType.Infinite);
    }

    transaction.freezeWith(this.client);

    // Sign the transaction with the token adminKey and the token treasury account private key
    const signTx = await (
      await transaction.sign(operatorPrivateKey)
    ).sign(treasuryPrivateKey);

    const txResponse = await signTx.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return receipt?.tokenId?.toString();
  }

  /**
   * get nfts filtered and paginated by hederaTokenId and accountId
   * @param hederaTokenId
   * @param accountId
   * @param quantity
   * @param lastSerialNumber
   * @returns
   */
  async getAvailableByAccountId(
    tokenId: string,
    accountId: string,
    quantity?: number,
    last?: number
  ): Promise<number[]> {
    const limit = quantity || 100;
    const next = !!last ? `&serialnumber=lt:${last}` : '';
    const getSerialNumbersUrl = `${config.hedera.restEndpoint}${config.hedera.restEndpointVersion}tokens/${tokenId}/nfts?account.id=${accountId}&limit=${limit}${next}`;

    const data = await getPaginated(getSerialNumbersUrl, 'nfts', quantity);

    if (!data?.length) {
      return [];
    }

    return data.map((nft) => nft.serial_number);
  }

  async getInfo(tokenId: string, serialNumber?: number) {
    // Get NFT info from Hedera REST API
    const tokensRequest = await axios.get(
      `${config.hedera.restEndpoint}${
        config.hedera.restEndpointVersion
      }tokens/${tokenId}/nfts/${serialNumber || ''}?limit=500`
    );

    return tokensRequest?.data;
  }

  /**
   * get nfts filtered and paginated by hederaTokenId and accountId
   * @param hederaTokenId
   * @param accountId
   * @param quantity
   * @param lastSerialNumber
   * @returns
   */
  async getSerialNumbersByAccountId(
    hederaTokenId: string,
    accountId: string,
    quantity?: number,
    lastSerialNumber?: number
  ) {
    const limit = quantity || 100;
    const next = !!lastSerialNumber
      ? `&serialnumber=lt:${lastSerialNumber}`
      : '';
    const getSerialNumbersUrl = `${config.hedera.restEndpoint}${config.hedera.restEndpointVersion}tokens/${hederaTokenId}/nfts?account.id=${accountId}&limit=${limit}${next}`;

    return getPaginated(getSerialNumbersUrl, 'nfts', quantity);
  }

  async hasBalance(accountId: string, tokenId) {
    const hasBalance =
      (await this.getSerialNumbersByAccountId(tokenId, accountId, 1))?.length >
      0;

    return hasBalance;
  }

  async mintNft(
    tokenId: string,
    quantity: number,
    metadata: string
  ): Promise<any[][]> {
    if (!metadata.includes('hedera://')) {
      metadata = `hedera://${metadata}`;
    }
    const treasuryAccount = this._account.getTreasuryAccount();

    const privateKey = PrivateKey.fromString(treasuryAccount.privateKey);
    const encodedMetadata = (value) => new TextEncoder().encode(value);

    const metadataSizeLimit = 10;
    const metadataSizes = Array(Math.ceil(quantity / metadataSizeLimit)).fill(
      metadataSizeLimit
    );
    metadataSizes[metadataSizes.length - 1] =
      quantity % metadataSizeLimit || metadataSizeLimit;

    const promisesBatchSize = 10;
    let serialNumbers: Long[][] = [[]];
    while (!!metadataSizes.length) {
      const currentMetaSizes = metadataSizes.splice(0, promisesBatchSize);

      const promises = currentMetaSizes.map(async (metaDataSize) => {
        const transaction = await new TokenMintTransaction().setTokenId(
          tokenId
        );
        transaction.setMetadata(
          Array(metaDataSize).fill(encodedMetadata(metadata))
        );
        transaction.freezeWith(this.client);
        const signTx = await transaction.sign(privateKey);
        const txResponse = await signTx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        logger.info(`mint receipt status ${receipt.status.toString()}`);

        return receipt.serials;
      });
      const resultSerialNumbers = await Promise.all(promises);
      serialNumbers = serialNumbers.concat(resultSerialNumbers);
    }

    return serialNumbers;
  }

  async swapNfts(
    fromTokenId: string,
    toTokenId: string,
    fromAccount: PrivateAccountInfo,
    toAccount: PrivateAccountInfo,
    fromSerialNumbers: number[],
    toSerialNumbers: number[]
  ) {
    const toAccountPrivateKey = PrivateKey.fromString(toAccount.privateKey);
    const fromAccountPrivateKey = PrivateKey.fromString(fromAccount.privateKey);

    const transaction = await new TransferTransaction();

    fromSerialNumbers.map((serialNumber) => {
      transaction.addNftTransfer(
        fromTokenId,
        serialNumber,
        fromAccount.accountId,
        toAccount.accountId
      );
    });

    toSerialNumbers.forEach((serialNumber) => {
      transaction.addNftTransfer(
        toTokenId,
        serialNumber,
        fromAccount.accountId,
        toAccount.accountId
      );
    });

    transaction.freezeWith(this.client);

    const txResponse = await (
      await (
        await transaction.sign(toAccountPrivateKey)
      ).sign(fromAccountPrivateKey)
    ).execute(this.client);

    return txResponse.getReceipt(this.client);
  }

  async transferTokenOwnership(
    toAccount: PrivateAccountInfo,
    fromAccount: PrivateAccountInfo,
    tokenId: string,
    serialNumbers: number[]
  ): Promise<any> {
    const privateKey = PrivateKey.fromString(fromAccount.privateKey);

    const transaction = await new TransferTransaction();

    serialNumbers.forEach((serialNumber) => {
      transaction.addNftTransfer(
        tokenId,
        serialNumber,
        fromAccount.accountId,
        toAccount.accountId
      );
    });

    transaction.freezeWith(this.client);

    const signTx = await transaction.sign(privateKey);
    const txResponse = await signTx.execute(this.client);

    return txResponse.getReceipt(this.client);
  }
}
