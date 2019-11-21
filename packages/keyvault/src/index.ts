import { greet } from '../rust/pkg';

const msg = greet("world");
console.log(msg);
