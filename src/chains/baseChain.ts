import { IChainAccountService } from "./types/account";
import { IChainClient } from "./types/client";
import { IChainTokenFileService } from "./types/tokenFileService";
import { IChainTokenService } from "./types/tokenService";

export interface IBaseChain {
    accountService: IChainAccountService
    _client: IChainClient;
    fileService: IChainTokenFileService;
    tokenService: IChainTokenService;
}