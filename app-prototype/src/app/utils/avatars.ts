import bunny from '../assets/avatars/bunny.svg';
import cat from '../assets/avatars/cat.svg';
import fox from '../assets/avatars/fox.svg';
import bear from '../assets/avatars/bear.svg';

export type AvatarId = 'bunny' | 'cat' | 'fox' | 'bear';

interface AvatarInfo {
  id: AvatarId;
  name: string;
  image: string;
  accent: string;
}

export const AVATAR_MAP: Record<AvatarId, AvatarInfo> = {
  bunny: { id: 'bunny', name: 'Nuppu Bunny', image: bunny, accent: '#D4C5F9' },
  cat: { id: 'cat', name: 'Hippu Cat', image: cat, accent: '#B8D4C7' },
  fox: { id: 'fox', name: 'Lumo Fox', image: fox, accent: '#F5B5A8' },
  bear: { id: 'bear', name: 'Muru Bear', image: bear, accent: '#E8C468' },
};

export function getAvatarImage(id: string): string {
  return AVATAR_MAP[id as AvatarId]?.image ?? AVATAR_MAP.bunny.image;
}

export function getAvatarName(id: string): string {
  return AVATAR_MAP[id as AvatarId]?.name ?? AVATAR_MAP.bunny.name;
}
