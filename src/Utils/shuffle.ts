/**
 * @author Ubert Guertin
 * @file /src/Utils/shuffle.ts
 *
 * Mélange aléatoirement les éléments d’un tableau en utilisant l’algorithme de Fisher-Yates (Knuth Shuffle).
 *
 * Cette fonction retourne un nouveau tableau avec les éléments mélangés,
 * sans modifier le tableau d’origine.
 *
 * @template T - Le type des éléments du tableau.
 * @param {T[]} array - Le tableau à mélanger.
 * @returns {T[]} Un nouveau tableau contenant les mêmes éléments, dans un ordre aléatoire.
 */

export default function shuffle<T>(array: T[]): T[] {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [
      shuffledArray[j]!,
      shuffledArray[i]!,
    ];
  }

  return shuffledArray;
}
