import { expectType } from 'tsd';
import { VERSION } from '../src/index.js';

// Verify VERSION is typed as string
expectType<string>(VERSION);
