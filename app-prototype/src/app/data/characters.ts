import type { Species } from '../components/CharacterAvatar';

export type CharacterId = 'nuppu' | 'muru' | 'hippu' | 'lumo' | 'common';

export interface CharacterMeta {
  id: CharacterId;
  species?: Species;
  wheelchair?: boolean;
  bgLight: string;
  bgStrong: string;
  textStrong: string;
}

export const CHARACTERS: Record<CharacterId, CharacterMeta> = {
  common: {
    id: 'common',
    bgLight: 'bg-nuppu-lavender-light',
    bgStrong: 'bg-nuppu-lavender',
    textStrong: 'text-nuppu-blue-deep',
  },
  nuppu: {
    id: 'nuppu',
    species: 'bunny',
    bgLight: 'bg-nuppu-nuppu-lavender-light',
    bgStrong: 'bg-nuppu-nuppu-lavender',
    textStrong: 'text-nuppu-blue-deep',
  },
  muru: {
    id: 'muru',
    species: 'bear',
    wheelchair: true,
    bgLight: 'bg-nuppu-muru-gold-light',
    bgStrong: 'bg-nuppu-muru-gold',
    textStrong: 'text-[#8a641f]',
  },
  hippu: {
    id: 'hippu',
    species: 'cat',
    bgLight: 'bg-nuppu-hippu-sage-light',
    bgStrong: 'bg-nuppu-hippu-sage',
    textStrong: 'text-[#3f6355]',
  },
  lumo: {
    id: 'lumo',
    species: 'fox',
    bgLight: 'bg-nuppu-lumo-coral-light',
    bgStrong: 'bg-nuppu-lumo-coral',
    textStrong: 'text-[#b85535]',
  },
};

export const CHARACTER_LIST: CharacterMeta[] = [CHARACTERS.nuppu, CHARACTERS.muru, CHARACTERS.hippu, CHARACTERS.lumo];
