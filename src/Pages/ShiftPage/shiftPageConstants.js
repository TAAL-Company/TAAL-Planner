import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

export const cacheRtl = createCache({ key: 'shift-rtl', stylisPlugins: [prefixer, rtlPlugin] });
export const cacheLtr = createCache({ key: 'shift-ltr', stylisPlugins: [prefixer] });
