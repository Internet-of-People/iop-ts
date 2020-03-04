# IoP SDK

## AuthorityAPI

Contains all interfaces, types and enums that are needed to communicate with an Authority service.

## IO

Common interfaces, types and enums that are required for creating various Morpheus requests and statements.

## JsonUtils

### digest

Calculates the ContentId of any content representible as a JSON object.

```typescript
import { JsonUtils } from '@internet-of-people/sdk';

// Example
const contentId = JsonUtils.digest(...);
```

## Utils

### nonce264

Produces a 45 character string with 264 bits of entropy to be used as a nonce.

```typescript
import { Utils } from '@internet-of-people/sdk';

// Example
const nonce = Utils.nonce264();
```

### Log

A simple logger utlity that used by other Morpheus packages for consistent log prefixing. Uses the Logger interface from `@arkecosystem/core-interfaces`.

```typescript
import { Utils } from '@internet-of-people/sdk';

// Example
// Where container is a Container.IContainer from @arkecosystem/core-interfaces
const log = new Utils.AppLog(container.resolvePlugin('logger'));
log.debug('hello');
```

## Check also

Please read about maintainers, contribution contract at <https://github.com/Internet-of-People/morpheus-ts>