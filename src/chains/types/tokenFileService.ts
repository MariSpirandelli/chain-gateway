import { FileData } from '../../types/token';

export interface IChainTokenFileService {
  create(file: FileData): Promise<string>;
  getContents(fileId: string);
  getInfo(fileId: string);
  update(fileId: string, file: FileData);
}
