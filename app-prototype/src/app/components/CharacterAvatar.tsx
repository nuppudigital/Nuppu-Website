import nuppuBunny from '../../assets/png/NUPPU BUNNY.png';
import muruBear from '../../assets/png/MURU BEAR.png';
import hippuCat from '../../assets/png/HIPPU CAT.png';
import lumoFox from '../../assets/png/LUMO FOX.png';

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
}: {
  species: Species;
  className?: string;
  wheelchair?: boolean;
}) {
  return <img src={ART[species]} alt={species} className={`${className} object-contain`} />;
}
