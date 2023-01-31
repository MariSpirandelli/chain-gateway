import {
  Client,
  FileContentsQuery,
  FileCreateTransaction,
  FileInfoQuery,
  FileUpdateTransaction,
  PrivateKey,
} from '@hashgraph/sdk';
import { IChainTokenFileService } from '../types/tokenFileService';
import { FileData } from '../../types/token';
import { IHederaClient } from './client';
import { IHederaAccount } from './account';

export interface IHederaFile extends IChainTokenFileService {}

export default class HederaFile implements IHederaFile {
  protected _client: IHederaClient;
  protected _account: IHederaAccount;

  constructor(_client: IHederaClient, account: IHederaAccount) {
    this._client = _client;
    this._account = account;
  }

  private get client() {
    return this.client as any as Client;
  }

  async create(file: FileData) {
    const {
      name,
      description,
      cover,
      media,
      usdzMedia,
      environmentMedia,
      excerpt,
      category,
      tokenTags,
      tokenQualities,
    } = file;

    const fileContent = JSON.stringify({
      title: 'QF-Tag',
      type: 'object',
      properties: {
        name,
        description,
        image: cover,
        properties: {
          media,
          usdzMedia,
          environmentMedia,
          excerpt,
          category,
          tags: tokenTags?.split(','),
          qualities: tokenQualities?.reduce(
            (acc, quality) => ({ ...acc, [quality.key]: quality.value }),
            {}
          ),
        },
      },
    });

    const privateKey = PrivateKey.fromString(
      this._account.getTreasuryAccount().privateKey
    );

    const transaction = await new FileCreateTransaction()
      .setKeys([privateKey])
      .setContents(fileContent)
      .freezeWith(this.client);

    const response = await transaction.execute(this.client);
    const receipt = await response.getReceipt(this.client);

    return `hedera://${receipt?.fileId?.toString()}`;
  }

  async update(fileId: string, file: FileData) {
    const {
      name,
      description,
      cover,
      media,
      excerpt,
      category,
      tokenTags,
      tokenQualities,
    } = file;

    const fileContent = JSON.stringify({
      title: 'QF-Tag',
      type: 'object',
      properties: {
        name,
        description,
        image: cover,
        properties: {
          media,
          excerpt,
          category,
          tags: tokenTags?.split(','),
          qualities: tokenQualities?.reduce(
            (acc, quality) => ({ ...acc, [quality.key]: quality.value }),
            {}
          ),
        },
      },
    });

    const privateKey = PrivateKey.fromString(
      this._account.getTreasuryAccount().privateKey
    );

    const transaction = await new FileUpdateTransaction()
      .setFileId(fileId)
      .setContents(fileContent)
      .freezeWith(this.client);

    const signTx = await transaction.sign(privateKey);
    const submitTx = await signTx.execute(this.client);
    const receipt = await submitTx.getReceipt(this.client);

    return receipt;
  }

  async getContents(fileId: string) {
    const query = new FileContentsQuery().setFileId(fileId);
    const queryResponse = await query.execute(this.client);
    const file = JSON.parse(queryResponse.toString());

    return file;
  }

  async getInfo(fileId: string) {
    const query = new FileInfoQuery().setFileId(fileId);
    const info = await query.execute(this.client);

    return info;
  }
}
