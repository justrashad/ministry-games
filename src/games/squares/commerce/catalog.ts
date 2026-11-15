import { ERA_PACKS } from '../../../core/commerce/eraPacks';
import type { PackInfo } from '../../../core/commerce/packChoices';

/*
 * The paid packs, as the store shows them. Only names and descriptions live in the
 * public app; the questions are sent by the server after a pack's key checks out.
 * A test keeps this list in sync with server/squares/packs.ts.
 */
export const PACK_CATALOG: PackInfo[] = ERA_PACKS;
