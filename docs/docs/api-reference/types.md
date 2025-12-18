# TypeScript Types

Complete TypeScript type definitions for Raven Client.

## Core Types

### `NudgeClientOptions`

```typescript
interface NudgeClientOptions {
  listeners: NudgeClientListeners;
  config: NudgeClientConfig;
}
```

### `NudgeClientConfig`

```typescript
interface NudgeClientConfig {
  baseUrl: string;
  userId: string | number;
  appVersion: string;
  codepushVersion?: string;
  platform: string;
  nudgeRouteName: string;
  packageName: string;
}
```

### `NudgeClientListeners`

```typescript
interface NudgeClientListeners {
  appEvent: (eventName: string, props?: unknown) => void;
  fetchCtaApi: <TVariables, TData>(
    url: string,
    method: string,
    variables?: TVariables,
  ) => Promise<TData>;
  getAccessToken: () => AccessToken;
}
```

### `AccessToken`

```typescript
interface AccessToken {
  token: string;
  tokenType: string;
}
```

## Event Types

### `CTAEvent`

```typescript
interface CTAEvent {
  eventName: string;
  actionDone: boolean;
  ActiveScreenName?: string;
  routeName: string;
  is_from_rn: boolean;
  [key: string]: boolean | string | number;
}
```

## CTA Types

### `Cta`

```typescript
interface Cta {
  ctaId: string;
  rule: {
    actions: CtaActionType[];
    contextParams: string[];
    priority: number;
    frequency: FrequencyRules;
    groupByConfig?: GroupByConfig;
    stateToAction: Record<string, string>;
    resetStates: string[];
    resetCTAonFirstLaunch: boolean;
    stateTransition: StateTransition;
    stateMachineTTL: number | null;
    ctaValidTill: number | null;
  };
  resetAt: number[];
  actionDoneAt: number[];
  activeStateMachines: ActiveStateMachines;
  behaviourTagName?: string;
}
```

### `CtaActionType`

```typescript
type CtaActionType =
  | CtaUIAction
  | CtaEventAction
  | CtaPopupAction
  | CtaTooltipAction;
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
  currentState: string;
  lastTransitionAt: number;
  context: Context;
  createdAt: number;
  reset: boolean;
}
```

### `StateTransition`

```typescript
type StateTransition = Record<string, Record<string, Transition[]>>;
```

### `Transition`

```typescript
interface Transition {
  transitionTo: string;
  filters?: Filters;
}
```

## Filter Types

### `Filters`

```typescript
interface Filters {
  operator: OperatorType;
  filter: (Filter | FilterGroup)[];
}
```

### `Filter`

```typescript
interface Filter {
  propertyName: string;
  propertyType: string;
  comparisonType: ComparisonType;
  comparisonValue: string | boolean | number;
  functions?: FilterFunctions;
}
```

### `ComparisonType`

```typescript
type ComparisonType = '=' | '>' | '<' | '>=' | '<=' | '!=';
```

### `OperatorType`

```typescript
type OperatorType = 'AND' | 'OR';
```

## Tooltip Types

### `TooltipOptions`

```typescript
interface TooltipOptions {
  title: string;
  subTitle?: string;
  targetId: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  backgroundColor?: string;
  titleColor?: string;
  subTitleColor?: string;
  titleFontSize?: number;
  subTitleFontSize?: number;
  titleFontFamily?: string;
  subTitleFontFamily?: string;
  titleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  subTitleFontWeight?: 'Bold' | 'Medium' | 'Regular';
  targetScreen?: string;
  triggerType?: 'mount' | 'click' | 'event';
  triggerDelay?: number;
  autoDismissMs?: number;
  dismissOnOutsideTouch?: boolean;
  titleAlignment?: 'left' | 'center' | 'right';
  subTitleAlignment?: 'left' | 'center' | 'right';
  arrowSize?: number;
  borderRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
}
```

## Storage Types

### `IStorage`

```typescript
interface IStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### `StorageConfig`

```typescript
interface StorageConfig {
  // Storage configuration options
}
```

## Nudge Types

### `NudgeParams`

```typescript
interface NudgeParams {
  // Nudge parameters
}
```

## Usage

Import types as needed:

```tsx
import type {
  NudgeClientOptions,
  NudgeClientConfig,
  CTAEvent,
  TooltipOptions,
  IStorage,
} from '@dreamhorizonorg/raven-client';
```

## Next Steps

- [API Reference](/api-reference/nudge-client) - See API documentation
- [Quick Start](/getting-started/quick-start) - Use types in your app

