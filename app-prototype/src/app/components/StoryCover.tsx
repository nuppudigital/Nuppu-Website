import nuppuMark from '../../assets/png/NUPPU MARK.png';
import { CharacterAvatar } from './CharacterAvatar';
import type { CharacterMeta } from '../data/characters';

export function StoryCover({
  photoUrl,
  character,
  avatarClassName,
}: {
  photoUrl?: string;
  character: CharacterMeta;
  avatarClassName: string;
}) {
  if (photoUrl) return <img src={photoUrl} alt="" className="h-full w-full object-cover" />;
  if (character.species) {
    return <CharacterAvatar species={character.species} wheelchair={character.wheelchair} className={avatarClassName} />;
  }
  return <img src={nuppuMark} alt="" className={`${avatarClassName} object-contain opacity-70`} />;
}
