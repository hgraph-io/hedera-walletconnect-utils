import { SessionCredentials } from "@src/types/walletConnectSession"

export function collectSessionCredentials(): SessionCredentials {
    return {
        hederaAccountId: sessionStorage.getItem('accountId') ?? undefined,
        hederaPrivateKey: sessionStorage.getItem('privateKey') ?? undefined,
        walletConnectProjectId: sessionStorage.getItem('projectId') ?? undefined,
    }
}
