interface FileMeta {
  key: string;
  value: string;
}

export interface FileData {
  name: string;
  description: string;
  cover: string;
  media: string;
  usdzMedia?: string;
  environmentMedia?: string;
  excerpt: string;
  category?: string;
  tokenTags?: string;
  tokenQualities?: FileMeta[];
}

export interface CreateTokenInput {
  name: string;
  category: string;
  media: string;
  usdzMedia: string;
  environmentMedia: string;
  cover: string;
  excerpt: string;
  description: string;
  tokenTags: string;
  tokenQualities?: FileMeta[];
  quantity: number;
  maxSupply: number;
  toAccountId: string;
  toAccountPrivateKey: string;
  chainType;
}
