import nuppuBunny from '../../assets/png/NUPPU BUNNY.png';
import muruBear from '../../assets/png/MURU BEAR.png';
import hippuCat from '../../assets/png/HIPPU CAT.png';
import lumoFox from '../../assets/png/LUMO FOX.png';
import nuppuMark from '../../assets/png/NUPPU MARK.png';

export type Species = 'bunny' | 'bear' | 'cat' | 'fox';

const ART: Record<Species, string> = {
  bunny: nuppuBunny,
  bear: muruBear,
  cat: hippuCat,
  fox: lumoFox,
};

export function CharacterAvatar({
  species,
  className = '',
  realArt = false,
}: {
  species: Species;
  className?: string;
  wheelchair?: boolean;
  realArt?: boolean;
}) {
  // Showing the Nuppu mark instead of ART[species] for now, until the character art is ready everywhere.
  return <img src={realArt ? ART[species] : nuppuMark} alt={species} className={`${className} object-contain`} />;
}
