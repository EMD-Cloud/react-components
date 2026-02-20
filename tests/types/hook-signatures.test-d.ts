import { assertType, expectTypeOf, test } from 'vitest'
import { DatabaseSaveMode } from '@emd-cloud/sdk'
import type {
  AuthUserResponse,
  DatabaseUpdateOptions,
  Database,
  EmdCloud,
  ServerError,
  ValidationError,
} from '@emd-cloud/sdk'

import type { UseAuthReturn } from 'src/hooks/useAuth'
import type { UseChatReturn } from 'src/hooks/useChat'
import type { UseDatabaseReturn } from 'src/hooks/useDatabase'
import type { UseUserInteractionReturn } from 'src/hooks/useUserInteraction'
import type { UseWebhookReturn } from 'src/hooks/useWebhook'

type Expect<T extends true> = T
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false

declare const sdk: EmdCloud
declare const sdkDb: Database
declare const authHook: UseAuthReturn
declare const userHook: UseUserInteractionReturn
declare const webhookHook: UseWebhookReturn
declare const chatHook: UseChatReturn
declare const databaseHook: UseDatabaseReturn

test('useAuth methods keep SDK-compatible signatures', () => {
  type LoginSig = Expect<Equal<UseAuthReturn['logInUser'], EmdCloud['auth']['login']>>
  type RegistrationSig = Expect<
    Equal<UseAuthReturn['signUpUser'], EmdCloud['auth']['registration']>
  >
  type SocialLoginSig = Expect<
    Equal<UseAuthReturn['socialLogin'], EmdCloud['auth']['socialLogin']>
  >
  type ExchangeOAuthSig = Expect<
    Equal<UseAuthReturn['exchangeOAuthToken'], EmdCloud['auth']['exchangeOAuthToken']>
  >
  type ForgotPasswordSig = Expect<
    Equal<UseAuthReturn['forgotPassword'], EmdCloud['auth']['forgotPassword']>
  >
  type ForgotPasswordCheckSig = Expect<
    Equal<
      UseAuthReturn['forgotPasswordCheckCode'],
      EmdCloud['auth']['forgotPasswordCheckCode']
    >
  >
  type ForgotPasswordChangeSig = Expect<
    Equal<UseAuthReturn['forgotPasswordChange'], EmdCloud['auth']['forgotPasswordChange']>
  >
  type UpdateUserSig = Expect<Equal<UseAuthReturn['updateUser'], EmdCloud['auth']['updateUser']>>

  assertType<LoginSig>(true)
  assertType<RegistrationSig>(true)
  assertType<SocialLoginSig>(true)
  assertType<ExchangeOAuthSig>(true)
  assertType<ForgotPasswordSig>(true)
  assertType<ForgotPasswordCheckSig>(true)
  assertType<ForgotPasswordChangeSig>(true)
  assertType<UpdateUserSig>(true)

  const authResult = authHook.authorization('auth-token')
  expectTypeOf(authResult).toEqualTypeOf<ReturnType<EmdCloud['auth']['authorization']>>()

  const rawAuthResult = authHook.authorization('auth-token', {
    ignoreFormatResponse: true,
  })
  expectTypeOf(rawAuthResult).toEqualTypeOf<
    Promise<AuthUserResponse | ServerError | ValidationError | null>
  >()
})

test('useUserInteraction methods match SDK signatures', () => {
  type AttachSig = Expect<
    Equal<UseUserInteractionReturn['attachSocialAccount'], EmdCloud['user']['attachSocialAccount']>
  >
  type DetachSig = Expect<
    Equal<UseUserInteractionReturn['detachSocialAccount'], EmdCloud['user']['detachSocialAccount']>
  >
  type PingSig = Expect<Equal<UseUserInteractionReturn['ping'], EmdCloud['user']['ping']>>
  type ListSig = Expect<Equal<UseUserInteractionReturn['getUserList'], EmdCloud['user']['getUserList']>>
  type DetailsSig = Expect<
    Equal<UseUserInteractionReturn['getUserDetails'], EmdCloud['user']['getUserDetails']>
  >

  assertType<AttachSig>(true)
  assertType<DetachSig>(true)
  assertType<PingSig>(true)
  assertType<ListSig>(true)
  assertType<DetailsSig>(true)
})

test('useWebhook methods match SDK signatures', () => {
  type WebhookSig = Expect<
    Equal<UseWebhookReturn['callWebhook'], EmdCloud['webhook']['call']>
  >
  assertType<WebhookSig>(true)
})

test('useChat methods match SDK signatures', () => {
  type ListChannelsSig = Expect<
    Equal<UseChatReturn['listChannels'], EmdCloud['chat']['listChannels']>
  >
  type CreateChannelSig = Expect<
    Equal<UseChatReturn['createChannelByType'], EmdCloud['chat']['createChannelByType']>
  >
  type UpsertChannelSig = Expect<
    Equal<UseChatReturn['upsertChannel'], EmdCloud['chat']['upsertChannel']>
  >
  type GetChannelSig = Expect<
    Equal<UseChatReturn['getChannel'], EmdCloud['chat']['getChannel']>
  >
  type DeleteChannelSig = Expect<
    Equal<UseChatReturn['deleteChannel'], EmdCloud['chat']['deleteChannel']>
  >
  type SendMessageSig = Expect<
    Equal<UseChatReturn['sendMessage'], EmdCloud['chat']['sendMessage']>
  >
  type ListMessagesSig = Expect<
    Equal<UseChatReturn['listMessages'], EmdCloud['chat']['listMessages']>
  >
  type DeleteMessageSig = Expect<
    Equal<UseChatReturn['deleteMessage'], EmdCloud['chat']['deleteMessage']>
  >
  type UnreadCountSig = Expect<
    Equal<UseChatReturn['getUnreadCount'], EmdCloud['chat']['getUnreadCount']>
  >

  assertType<ListChannelsSig>(true)
  assertType<CreateChannelSig>(true)
  assertType<UpsertChannelSig>(true)
  assertType<GetChannelSig>(true)
  assertType<DeleteChannelSig>(true)
  assertType<SendMessageSig>(true)
  assertType<ListMessagesSig>(true)
  assertType<DeleteMessageSig>(true)
  assertType<UnreadCountSig>(true)

  const hookListMessages = chatHook.listMessages('channel-id', { limit: 1 })
  const sdkListMessages = sdk.chat.listMessages('channel-id', { limit: 1 })
  expectTypeOf(hookListMessages).toEqualTypeOf(sdkListMessages)
})

test('useDatabase methods mirror SDK returns with collectionId prefix', () => {
  type RowSchema = { title: string }

  const hookRows = databaseHook.getRows<RowSchema>('collection-id', { limit: 10 })
  const sdkRows = sdkDb.getRows<RowSchema>({ limit: 10 })
  expectTypeOf(sdkRows).toMatchTypeOf(hookRows)

  const hookRowsRaw = databaseHook.getRows<RowSchema>(
    'collection-id',
    { limit: 10 },
    { ignoreFormatResponse: true },
  )
  const sdkRowsRaw = sdkDb.getRows<RowSchema>({ limit: 10 }, { ignoreFormatResponse: true })
  expectTypeOf(sdkRowsRaw).toMatchTypeOf(hookRowsRaw)

  const hookCount = databaseHook.countRows('collection-id', {})
  const sdkCount = sdkDb.countRows({})
  expectTypeOf(hookCount).toEqualTypeOf(sdkCount)

  const hookRow = databaseHook.getRow<RowSchema>('collection-id', 'row-id')
  const sdkRow = sdkDb.getRow<RowSchema>('row-id')
  expectTypeOf(hookRow).toEqualTypeOf(sdkRow)

  const hookCreate = databaseHook.createRow<RowSchema>('collection-id', { title: 'A' })
  const sdkCreate = sdkDb.createRow<RowSchema>({ title: 'A' })
  expectTypeOf(hookCreate).toEqualTypeOf(sdkCreate)

  const hookUpdate = databaseHook.updateRow<RowSchema>('collection-id', 'row-id', { title: 'B' })
  const sdkUpdate = sdkDb.updateRow<RowSchema>('row-id', { title: 'B' })
  expectTypeOf(sdkUpdate).toMatchTypeOf(hookUpdate)

  const hookBulk = databaseHook.bulkUpdate('collection-id', {
    query: {},
    data: { title: 'C' },
    notice: 'bulk-update',
  })
  const sdkBulk = sdkDb.bulkUpdate({
    query: {},
    data: { title: 'C' },
    notice: 'bulk-update',
  })
  expectTypeOf(hookBulk).toEqualTypeOf(sdkBulk)

  const hookDeleteRow = databaseHook.deleteRow('collection-id', 'row-id')
  const sdkDeleteRow = sdkDb.deleteRow('row-id')
  expectTypeOf(hookDeleteRow).toEqualTypeOf(sdkDeleteRow)

  const hookDeleteRows = databaseHook.deleteRows('collection-id', ['row-id'])
  const sdkDeleteRows = sdkDb.deleteRows(['row-id'])
  expectTypeOf(hookDeleteRows).toEqualTypeOf(sdkDeleteRows)

  const hookTrigger = databaseHook.triggerButton('collection-id', 'row-id', 'column-id')
  const sdkTrigger = sdkDb.triggerButton('row-id', 'column-id')
  expectTypeOf(hookTrigger).toEqualTypeOf(sdkTrigger)
})

test('useDatabase mirrors SDK getRows overload narrowing', () => {
  type RowSchema = { title: string; description: string }

  const optimisedOptions = { hasOptimiseResponse: true } as const
  const hookOptimised = databaseHook.getRows<RowSchema>('collection-id', optimisedOptions)
  const sdkOptimised = sdkDb.getRows<RowSchema>(optimisedOptions)
  expectTypeOf(hookOptimised).toEqualTypeOf(sdkOptimised)

  const hookOptimisedRaw = databaseHook.getRows<RowSchema>(
    'collection-id',
    optimisedOptions,
    { ignoreFormatResponse: true },
  )
  const sdkOptimisedRaw = sdkDb.getRows<RowSchema>(
    optimisedOptions,
    { ignoreFormatResponse: true },
  )
  expectTypeOf(hookOptimisedRaw).toEqualTypeOf(sdkOptimisedRaw)

  const projectedOptions = { ignoreColumns: ['description'] } as const
  const hookProjected = databaseHook.getRows<RowSchema>('collection-id', projectedOptions)
  const sdkProjected = sdkDb.getRows<RowSchema>(projectedOptions)
  expectTypeOf(hookProjected).toEqualTypeOf(sdkProjected)

  const hookProjectedRaw = databaseHook.getRows<RowSchema>(
    'collection-id',
    projectedOptions,
    { ignoreFormatResponse: true },
  )
  const sdkProjectedRaw = sdkDb.getRows<RowSchema>(
    projectedOptions,
    { ignoreFormatResponse: true },
  )
  expectTypeOf(hookProjectedRaw).toEqualTypeOf(sdkProjectedRaw)
})

test('useDatabase mirrors SDK updateRow saveMode narrowing', () => {
  type RowSchema = { title: string; status: 'draft' | 'published' }

  const hookAsync = databaseHook.updateRow<RowSchema>(
    'collection-id',
    'row-id',
    { status: 'published' },
    { saveMode: DatabaseSaveMode.ASYNC },
  )
  const sdkAsync = sdkDb.updateRow<RowSchema>(
    'row-id',
    { status: 'published' },
    { saveMode: DatabaseSaveMode.ASYNC },
  )
  expectTypeOf(hookAsync).toEqualTypeOf(sdkAsync)

  const hookAsyncRaw = databaseHook.updateRow<RowSchema>(
    'collection-id',
    'row-id',
    { status: 'published' },
    { saveMode: DatabaseSaveMode.ASYNC },
    { ignoreFormatResponse: true },
  )
  const sdkAsyncRaw = sdkDb.updateRow<RowSchema>(
    'row-id',
    { status: 'published' },
    { saveMode: DatabaseSaveMode.ASYNC },
    { ignoreFormatResponse: true },
  )
  expectTypeOf(hookAsyncRaw).toEqualTypeOf(sdkAsyncRaw)

  const hookSync = databaseHook.updateRow<RowSchema>(
    'collection-id',
    'row-id',
    { status: 'draft' },
    { saveMode: DatabaseSaveMode.SYNC },
  )
  const sdkSync = sdkDb.updateRow<RowSchema>(
    'row-id',
    { status: 'draft' },
    { saveMode: DatabaseSaveMode.SYNC },
  )
  expectTypeOf(hookSync).toEqualTypeOf(sdkSync)

  const broadOptions = { notice: 'update' } as DatabaseUpdateOptions
  const hookBroad = databaseHook.updateRow<RowSchema>(
    'collection-id',
    'row-id',
    { title: 'Updated title' },
    broadOptions,
  )
  const sdkBroad = sdkDb.updateRow<RowSchema>(
    'row-id',
    { title: 'Updated title' },
    broadOptions,
  )
  expectTypeOf(hookBroad).toEqualTypeOf(sdkBroad)
})
