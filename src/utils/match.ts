export interface PlayerScores {
  set1?: number;
  set2?: number;
  set3?: number;
  tiebreaker1?: number;
  tiebreaker2?: number;
  tiebreaker3?: number;
}

export interface MatchData {
  playerOne: PlayerScores;
  playerTwo: PlayerScores;
}

const isNumber = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v)

const isFinishedSet = (p1: number, p2: number, allowOneGameMargin = true) => {
  const max = Math.max(p1, p2)
  const diff = Math.abs(p1 - p2)
  // Normal finish: 6–0..6–4 (diff ≥ 2, winner at 6), or extended: 8–6, 9–7, ...
  if ((max === 6 && diff >= 2) || (max >= 7 && diff >= 2)) return true
  // Flexible “tiebreak-style” finish: 1-game margin (covers 7–6 and WTT 6–5)
  if (allowOneGameMargin && diff === 1) return true
  return false
}

/**
 * Determine the winner of a match based on set scores.
 * By default, only counts sets that look "finished".
 * Pass { requireFinished: false } if you want to count any higher number as winning.
 */
export function getMatchWinner(
  playerOne: PlayerScores,
  playerTwo: PlayerScores,
  opts: { requireFinished?: boolean; allowOneGameMargin?: boolean } = {}
): 'playerOne' | 'playerTwo' | null {
  const { requireFinished = true, allowOneGameMargin = true } = opts

  const sets = [1, 2, 3] as const
  let playerOneSets = 0
  let playerTwoSets = 0

  for (const setNum of sets) {
    const p1 = playerOne[`set${setNum}`]
    const p2 = playerTwo[`set${setNum}`]

    // Skip if either side is missing/not a number
    if (!isNumber(p1) || !isNumber(p2)) continue

    // Optionally ensure the set looks complete before awarding it
    if (requireFinished && !isFinishedSet(p1, p2, allowOneGameMargin)) continue

    if (p1 > p2) playerOneSets++
    else if (p2 > p1) playerTwoSets++
  }

  if (playerOneSets > playerTwoSets) return 'playerOne'
  if (playerTwoSets > playerOneSets) return 'playerTwo'
  return null
}

/**
 * Calculate set scores for the match report
 */
export function getSetScores(winner: 'playerOne' | 'playerTwo', playerOne: PlayerScores, playerTwo: PlayerScores) {
  const sets = [];

  for (let i = 1; i <= 3; i++) {
    const playerOneGames = playerOne[`set${i}` as keyof PlayerScores] || 0;
    const playerTwoGames = playerTwo[`set${i}` as keyof PlayerScores] || 0;

    // Skip sets with no scores
    if (playerOneGames === 0 && playerTwoGames === 0) continue;

    const playerOneTiebreaker = playerOne[`tiebreaker${i}` as keyof PlayerScores];
    const playerTwoTiebreaker = playerTwo[`tiebreaker${i}` as keyof PlayerScores];

    // Determine winner/loser games based on who won the set
    let winnerGames: number;
    let loserGames: number;
    let winnerTiebreak: number | undefined;
    let loserTiebreak: number | undefined;

    if (winner === 'playerOne') {
      winnerGames = playerOneGames;
      loserGames = playerTwoGames;
      winnerTiebreak = playerOneTiebreaker;
      loserTiebreak = playerTwoTiebreaker;
    } else {
      winnerGames = playerTwoGames;
      loserGames = playerOneGames;
      winnerTiebreak = playerTwoTiebreaker;
      loserTiebreak = playerOneTiebreaker;
    }

    sets.push({
      setNumber: i,
      winnerGames,
      loserGames,
      winnerTiebreak: winnerTiebreak || undefined,
      loserTiebreak: loserTiebreak || undefined,
    });
  }

  return sets;
}
