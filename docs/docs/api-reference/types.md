# TypeScript Types

Complete TypeScript type definitions for Raven Client.

## Core Types

### `RavenClientOptions`

```typescript
interface RavenClientOptions {
  listeners: RavenClientListeners
  config: RavenClientConfig
}
```

### `RavenClientConfig`

```typescript
interface RavenClientConfig {
  baseUrl: string
  userId: string | number
  appVersion: string
  codepushVersion?: string
  platform: string
  packageName: string
  tenantId?: string
}
```

### `RavenClientListeners`

```typescript
interface RavenClientListeners {
  appEvent: (eventName: string, props?: unknown) => void
  getAccessToken: () => AccessToken
}
```

### `AccessToken`

```typescript
interface AccessToken {
  token: string
  tokenType: string
}
```

## Constants

### `RAVEN_ROUTE_NAME`

The route name constant for the Nudge screen. Use this when registering the Nudge screen in your navigation stack.

```typescript
const RAVEN_ROUTE_NAME: string = 'Nudge'
```

**Usage:**

```tsx
import { RAVEN_ROUTE_NAME, Nudge } from '@dreamhorizonorg/raven-client'

<Stack.Screen name={RAVEN_ROUTE_NAME} component={Nudge} />
```

## Event Types

### `CTAEvent`

```typescript
type CTAEvent = {
  eventName: string
  // Users can add custom properties via the index signature below
} & {[key: string]: boolean | string | number}
```

**Note:** `actionDone` is managed internally by the SDK and is not part of the public `CTAEvent` type.

## CTA Types

### `Cta`

```typescript
interface Cta {
  ctaId: string
  rule: {
    actions: CtaActionType[]
    contextParams: string[]
    priority: number
    frequency: FrequencyRules
    groupByConfig?: GroupByConfig
    stateToAction: Record<string, string>
    resetStates: string[]
    resetCTAonFirstLaunch: boolean
    stateTransition: StateTransition
    stateMachineTTL: number | null
    ctaValidTill: number | null
  }
  resetAt: number[]
  actionDoneAt: number[]
  activeStateMachines: ActiveStateMachines
  behaviourTagName?: string
}
```

### `CtaActionType`

```typescript
type CtaActionType =
  | CtaUIAction
  | CtaEventAction
  | CtaPopupAction
  | CtaTooltipAction
```

### `ActionType`

```typescript
enum ActionType {
  NUDGE = 'NUDGE_UI',
  ACTION = 'NUDGE_ACTION',
  NUDGE_POPUP = 'POPUP',
  TOOLTIP = 'TOOLTIP',
}
```

## State Machine Types

### `StateMachineObject`

```typescript
interface StateMachineObject {
  currentState: string
  lastTransitionAt: number
  context: Context
  createdAt: number
  reset: boolean
}
```

### `StateTransition`

```typescript
type StateTransition = Record<string, Record<string, Transition[]>>
```

### `Transition`

```typescript
interface Transition {
  transitionTo: string
  filters?: Filters
}
```

## Filter Types

### `Filters`

```typescript
interface Filters {
  operator: OperatorType
  filter: (Filter | FilterGroup)[]
}
```

### `Filter`

```typescript
interface Filter {
  propertyName: string
  propertyType: string
  comparisonType: ComparisonType
  comparisonValue: string | boolean | number
  functions?: FilterFunctions
}
```

### `ComparisonType`

```typescript
type ComparisonType = '=' | '>' | '<' | '>=' | '<=' | '!='
```

### `OperatorType`

```typescript
type OperatorType = 'AND' | 'OR'
```

## Tooltip Types

### `TooltipOptions`

```typescript
interface TooltipOptions {
  title: string
  subTitle?: string
  targetId: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  backgroundColor?: string
  titleColor?: string
  subTitleColor?: string
  titleFontSize?: number
  subTitleFontSize?: number
  titleFontFamily?: string
  subTitleFontFamily?: string
  titleFontWeight?: 'Bold' | 'Medium' | 'Regular'
  subTitleFontWeight?: 'Bold' | 'Medium' | 'Regular'
  targetScreen?: string
  triggerType?: 'mount' | 'click' | 'event'
  triggerDelay?: number
  autoDismissMs?: number
  dismissOnOutsideTouch?: boolean
  titleAlignment?: 'left' | 'center' | 'right'
  subTitleAlignment?: 'left' | 'center' | 'right'
  arrowSize?: number
  borderRadius?: number
  paddingLeft?: number
  paddingRight?: number
  paddingTop?: number
  paddingBottom?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
}
```

## Storage Types

### `IStorage`

```typescript
interface IStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

### `StorageConfig`

```typescript
interface StorageConfig {
  // Storage configuration options
}
```

## Nudge Types

### `RavenParams`

```typescript
interface RavenParams {
  // Nudge parameters
}
```

## Usage

Import types as needed:

```tsx
import type {
  RavenClientOptions,
  RavenClientConfig,
  CTAEvent,
  TooltipOptions,
  IStorage,
} from '@dreamhorizonorg/raven-client'

// Import constants
import { RAVEN_ROUTE_NAME } from '@dreamhorizonorg/raven-client'
```

## Next Steps

- [API Reference](/api-reference/nudge-client) - See API documentation
- [Quick Start](/getting-started/quick-start) - Use types in your app
