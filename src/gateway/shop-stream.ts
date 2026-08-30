import type { ShopStreamEvent } from './types';

export const encodeSse = (event: ShopStreamEvent): string => {
  return `data: ${JSON.stringify(event)}\n\n`;
};
