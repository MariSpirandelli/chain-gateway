export interface CreateNftType {
  name: string;
  symbol: string;
  maxSupply: number;
  memo?: string;
}

export type AssociateType = {
  tokenIds: string[];
  destinationAccountId: string;
  destinationAccountPrivateKey: string;
  memo?: string;
};
