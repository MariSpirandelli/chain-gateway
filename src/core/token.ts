import ChainFactory from '../chains/factory';
import { CreateTokenInput } from '../types/token';

export default class Tokens {
  static async create(token: CreateTokenInput) {
    const {
      name,
      category,
      media,
      usdzMedia,
      environmentMedia,
      cover,
      excerpt,
      description,
      tokenTags,
      tokenQualities,
      quantity,
      maxSupply,
      toAccountId,
      toAccountPrivateKey,
      chainType,
    } = token;

    const chain = ChainFactory.getChainByNetwork(chainType);

    const fileId = await chain.file.create({
      name,
      category,
      media,
      usdzMedia,
      environmentMedia,
      cover,
      excerpt,
      description,
      tokenTags,
      tokenQualities,
    });

    const tokenMaxSupply = maxSupply || quantity;
    const tokenId = chain.token.createNft({
      name,
      symbol: fileId || '',
      maxSupply: tokenMaxSupply,
    });

    chain.token.associate({
      tokenIds: [tokenId],
      destinationAccountId: toAccountId,
      destinationAccountPrivateKey: toAccountPrivateKey,
      memo: fileId,
    });

    await chain.token.mintNft(tokenId, quantity, fileId);

    return {
      fileId,
      tokenId,
    };
  }
}
