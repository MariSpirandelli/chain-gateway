import { IChainAccountService } from "./types/account";
import { IChainClient } from "./types/client";
import { IChainTokenFileService } from "./types/tokenFileService";
import { IChainTokenService } from "./types/tokenService";

export class BaseChain {
    accountService: IChainAccountService
    client: IChainClient;
    tokenService: IChainTokenService;
    fileService: IChainTokenFileService;
}