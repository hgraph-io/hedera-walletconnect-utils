export type SessionRequestMethod = 'hedera_signAndExecuteTransaction';

export type SessionParams = {
    request: {
        method: string;
        params: any;
    };
    chainId: string;
};

export type SessionCredentials = {
    hederaAccountId?: string;
    hederaPrivateKey?: string;
    walletConnectProjectId?: string;
}