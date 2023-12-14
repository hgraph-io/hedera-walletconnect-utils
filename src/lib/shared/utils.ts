import { Buffer } from 'buffer'
import { AccountId, Transaction, LedgerId, Query } from '@hashgraph/sdk'
import { ProposalTypes, SessionTypes } from '@walletconnect/types'
import SignatureMap from '@hashgraph/sdk/lib/transaction/SignatureMap'
import hashgraphNamespace from '@hashgraph/proto'
// import { keccak256 } from 'web3-utils'

/**
 * Freezes a transaction if it is not already frozen. Transactions must
 * be frozen before they can be converted to bytes.
 *
 * @param transaction - Any instance of a class that extends `Transaction`
 */
export function freezeTransaction<T extends Transaction>(transaction: T): void {
  if (!transaction.isFrozen()) {
    transaction.freeze()
  }
}

/**
 * Sets a default consensus node that a transaction will be submitted to. Node Account ID(s)
 * must be set before a transaction can be frozen. If they have already been set, this
 * function will not modify the transaction.
 * @param transaction - any instance of a class that extends `Transaction`
 *
 * @see {@link https://docs.hedera.com/hedera/networks/testnet/testnet-nodes | Full list of Testnet-nodes}
 * @see {@link https://docs.hedera.com/hedera/networks/mainnet/mainnet-nodes | Full list of Mainnet-nodes}
 */
export function setDefaultNodeAccountIds<T extends Transaction>(transaction: T): void {
  const isNodeAccountIdNotSet =
    !transaction.nodeAccountIds || transaction.nodeAccountIds.length === 0
  if (!transaction.isFrozen() && isNodeAccountIdNotSet) {
    //TODO: add nodes
    transaction.setNodeAccountIds([new AccountId(3)])
  }
}

/**
 * Converts `Transaction` to a Base64-string.
 *
 * First converts a transaction to bytes and then encodes it as a Base64-string. Will attempt
 * to set default Node Account ID and freeze the transaction before converting.
 * @param transaction - Any instance of a class that extends `Transaction`
 * @returns Base64 encoded representation of the input `Transaction` object
 */
export function transactionToBase64String<T extends Transaction>(transaction: T): string {
  setDefaultNodeAccountIds(transaction)
  freezeTransaction(transaction)
  const transactionBytes = transaction.toBytes()
  return Buffer.from(transactionBytes).toString('base64')
}

/**
 * Recreates a `Transaction` from a base64 encoded string.
 *
 * Decodes the string to a buffer,
 * then passes to `Transaction.fromBytes`. For greater flexibility, this function uses the base
 * `Transaction` class, but takes an optional type parameter if the type of transaction is known,
 * allowing stronger typeing.
 * @param transactionBytes - a base64 encoded string
 * @returns `Transaction`
 * @example
 * ```ts
 * const txn1 = base64StringToTransaction(bytesString)
 * const txn2 = base64StringToTransaction<TransferTransaction>(bytesString)
 * // txn1 type: Transaction
 * // txn2 type: TransferTransaction
 * ```
 */
export function base64StringToTransaction<T extends Transaction>(transactionBytes: string): T {
  const decoded = Buffer.from(transactionBytes, 'base64')
  return Transaction.fromBytes(decoded) as T
}

/**
 * Converts a `SignatureMap` to a base64 encoded string.
 *
 * First converts the `SignatureMap` object to a JSON.
 * Then encodes the JSON to a base64 encoded string.
 * @param signatureMap - The `SignatureMap` object to be converted
 * @returns Base64-encoded string representation of the input `SignatureMap`
 */
export function signatureMapToBase64(signatureMap: SignatureMap): string {
  return Buffer.from(JSON.stringify(signatureMap)).toString('base64')
}

/**
 * Converts a Base64-encoded string to a `hashgraphNamespace.proto.ISignatureMap`.
 * @param base64string - Base64-encoded string
 * @returns `hashgraph.proto.ISignatureMap`
 */
export function base64StringToSignatureMap(
  base64string: string,
): hashgraphNamespace.proto.ISignatureMap {
  const decoded = Buffer.from(base64string, 'base64').toString('utf-8')
  return JSON.parse(decoded) as hashgraphNamespace.proto.ISignatureMap
}

/**
 * Encodes the binary data represented by the `Uint8Array` to a Base64 string.
 * @param binary - The `Uint8Array` containing binary data to be converted
 * @returns Base64-encoded string representation of the input `Uint8Array`
 */
export function Uint8ArrayToBase64String(binary: Uint8Array): string {
  return Buffer.from(binary).toString('base64')
}

/**
 * Converts a Base64-encoded string to a `Uint8Array`.
 * @param base64string - Base64-encoded string to be converted
 * @returns A `Uint8Array` representing the decoded binary data
 */
export function base64StringToUint8Array(base64string: string): Uint8Array {
  const decoded = Buffer.from(base64string, 'base64')
  return new Uint8Array(decoded)
}

/**
 * Converts a `Query` object to a Base64-encoded string.
 * First utilizes the `toBytes` method of the `Query` instance to obtain its binary `Uint8Array` representation.
 * Then encodes the binary `Uint8Array` to a Base64 string representation.
 * @param query - A `Query` object to be converted
 * @returns Base64 encoded representation of the input `Query` object
 */
export function queryToBase64String<T, Q extends Query<T>>(query: Q): string {
  const queryBytes = query.toBytes()
  return Buffer.from(queryBytes).toString('base64')
}

/**
 * Recreates a `Query` from a Base64-encoded string. First decodes the string to a buffer,
 * then passes to `Query.fromBytes`. For greater flexibility, this function uses the base
 * `Query` class, but takes an optional type parameter if the type of query is known,
 * allowing stronger typeing.
 * @param bytesString - Base64-encoded string
 * @returns `Query<T>`
 * @example
 * ```ts
 * const query1 = base64StringToQuery(bytesString)
 * const query2 = base64StringToQuery<AccountInfoQuery>(bytesString)
 * // query1 type: Query<any>
 * // query2 type: AccountInfoQuery
 * ```
 */
export function base64StringToQuery<Q extends Query<any>>(bytesString: string): Q {
  const decoded = Buffer.from(bytesString, 'base64')
  return Query.fromBytes(decoded) as Q
}

/**
 * Incorporates additional data (salt) into the message to alter the output signature.
 * This alteration ensures that passing a transaction here for signing will yield an invalid signature,
 * as the additional data modifies the signature text.
 * @param message -  A plain text string
 * @returns An array of Uint8Array containing the prepared message for signing
 */
export function stringToSignerMessage(message: string): Uint8Array[] {
  return [Buffer.from('\x19Hedera Signed Message:\n' + message.length + message)]
}

/**
 * A mapping of `LedgerId` to EIP chain id and CAIP-2 network name.
 *
 * Structure: [`LedgerId`, `number` (EIP155 chain id), `string` (CAIP-2 chain id)][]
 *
 * @see {@link https://namespaces.chainagnostic.org/hedera/README | Hedera Namespaces}
 * @see {@link https://hips.hedera.com/hip/hip-30 | CAIP Identifiers for the Hedera Network (HIP-30)}
 */
export const LEDGER_ID_MAPPINGS: [LedgerId, number, string][] = [
  [LedgerId.MAINNET, 295, 'hedera:mainnet'],
  [LedgerId.TESTNET, 296, 'hedera:testnet'],
  [LedgerId.PREVIEWNET, 297, 'hedera:previewnet'],
  [LedgerId.LOCAL_NODE, 298, 'hedera:devnet'],
]
const DEFAULT_LEDGER_ID = LedgerId.LOCAL_NODE
const DEFAULT_EIP = LEDGER_ID_MAPPINGS[3][1]
const DEFAULT_CAIP = LEDGER_ID_MAPPINGS[3][2]

/**
 * Converts an EIP chain id to a LedgerId object.
 *
 * If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 *
 * @param chainId - The EIP chain ID (number) to be converted
 * @returns A `LedgerId` corresponding to the provided chain ID
 * @example
 * ```ts
 * const localnodeLedgerId = EIPChainIdToLedgerId(298)
 * console.log(localnodeLedgerId) // LedgerId.LOCAL_NODE
 * const mainnetLedgerId = EIPChainIdToLedgerId(295)
 * console.log(mainnetLedgerId) // LedgerId.MAINNET
 * ```
 */
export function EIPChainIdToLedgerId(chainId: number): LedgerId {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId, chainId_] = LEDGER_ID_MAPPINGS[i]
    if (chainId === chainId_) {
      return ledgerId
    }
  }
  return DEFAULT_LEDGER_ID
}

/**
 * Converts a LedgerId object to an EIP chain id.
 *
 * If no mapping is found, returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param ledgerId - The `LedgerId` object to be converted
 * @returns A `number` representing the EIP chain id for the provided `LedgerId`
 * @example
 * ```ts
 * const previewnetChainId = ledgerIdToEIPChainId(LedgerId.PREVIEWNET)
 * console.log(previewnetChainId) // 297
 * const testnetChainId = ledgerIdToEIPChainId(LedgerId.TESTNET)
 * console.log(testnetChainId) // 296
 * ```
 */
export function ledgerIdToEIPChainId(ledgerId: LedgerId): number {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId_, chainId] = LEDGER_ID_MAPPINGS[i]
    if (ledgerId === ledgerId_) {
      return chainId
    }
  }
  return DEFAULT_EIP
}

/**
 * Converts a network name to an EIP chain id.
 * If no mapping is found, returns the EIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param networkName - The network name (string) to be converted
 * @returns A `number` representing the EIP chain id for the provided network name
 * @example
 * ```ts
 * const mainnetChainId = networkNameToEIPChainId('mainnet')
 * console.log(mainnetChainId) // 295
 * const testnetChainId = networkNameToEIPChainId('testnet')
 * console.log(mainnetChainId) // 296
 * ```
 */
export function networkNameToEIPChainId(networkName: string): number {
  const ledgerId = LedgerId.fromString(networkName.toLowerCase())
  return ledgerIdToEIPChainId(ledgerId)
}

/**
 * Converts a CAIP chain id to a LedgerId object.
 *
 * If no mapping is found, returns `LedgerId.LOCAL_NODE`.
 *
 * @param chainId - The CAIP chain ID (string) to be converted
 * @returns A `LedgerId` corresponding to the provided CAIP chain ID
 * @example
 * ```ts
 * const previewnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Previewnet)
 * console.log(previewnetLedgerId) // LedgerId.PREVIEWNET
 * const testnetLedgerId = CAIPChainIdToLedgerId(HederaChainId.Testnet)
 * console.log(testnetLedgerId) // LedgerId.TESTNET
 * ```
 */
export function CAIPChainIdToLedgerId(chainId: string): LedgerId {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId, _, chainId_] = LEDGER_ID_MAPPINGS[i]
    if (chainId === chainId_) {
      return ledgerId
    }
  }
  return DEFAULT_LEDGER_ID
}

/**
 * Converts a LedgerId object to a CAIP chain id.
 *
 * If no mapping is found, returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param ledgerId - The `LedgerId` object to be converted
 * @returns A `string` representing the CAIP chain id for the provided `LedgerId`
 * @example
 * ```ts
 * const mainnetChainId = ledgerIdToCAIPChainId(HederaChainId.Mainnet)
 * console.log(mainnetChainId) // LedgerId.PREVIEWNET
 * const testnetChainId = ledgerIdToCAIPChainId(HederaChainId.Testnet)
 * console.log(testnetChainId) // LedgerId.TESTNET
 * ```
 */
export function ledgerIdToCAIPChainId(ledgerId: LedgerId): string {
  for (let i = 0; i < LEDGER_ID_MAPPINGS.length; i++) {
    const [ledgerId_, _, chainId] = LEDGER_ID_MAPPINGS[i]
    if (ledgerId.toString() === ledgerId_.toString()) {
      return chainId
    }
  }
  return DEFAULT_CAIP
}

/**
 * Converts a network name to a CAIP chain id.
 *
 * If no mapping is found, returns the CAIP chain id for `LedgerId.LOCAL_NODE`.
 *
 * @param networkName - The network name (string) to be converted
 * @returns A `string` representing the CAIP chain id for the provided network name
 * @example
 * ```ts
 * const previewnetChainId = networkNameToCAIPChainId('previewnet')
 * console.log(previewnetChainId) // HederaChainId.Previewnet
 * const devnetChainId = networkNameToCAIPChainId('devnet')
 * console.log(devnetChainId) // HederaChainId.Devnet
 * ```
 */
export function networkNameToCAIPChainId(networkName: string): string {
  const ledgerId = LedgerId.fromString(networkName.toLowerCase())
  const chainId = ledgerIdToCAIPChainId(ledgerId)
  return chainId
}

/**
 * Create a `ProposalTypes.RequiredNamespaces` object for a given ledgerId.
 *
 * @param ledgerId - The `LedgerId` for which the namespaces are created
 * @param methods - An array of strings representing methods
 * @param events - An array of strings representing events
 * @returns A `ProposalTypes.RequiredNamespaces` object
 */
export const networkNamespaces = (
  ledgerId: LedgerId,
  methods: string[],
  events: string[],
): ProposalTypes.RequiredNamespaces => ({
  hedera: {
    chains: [ledgerIdToCAIPChainId(ledgerId)],
    methods,
    events,
  },
})

/**
 * Get the account and ledger from a `SessionTypes.Struct` object.
 *
 * @param session - The `SessionTypes.Struct` object containing namespaces
 * @returns `ProposalTypes.RequiredNamespaces` - an array of objects containing network (LedgerId) and account (AccountId)
 */
export const accountAndLedgerFromSession = (
  session: SessionTypes.Struct,
): { network: LedgerId; account: AccountId }[] => {
  const hederaNamespace = session.namespaces.hedera
  if (!hederaNamespace) throw new Error('No hedera namespace found')

  return hederaNamespace.accounts.map((account) => {
    const [chain, network, acc] = account.split(':')
    return {
      network: CAIPChainIdToLedgerId(chain + ':' + network),
      account: AccountId.fromString(acc),
    }
  })
}
