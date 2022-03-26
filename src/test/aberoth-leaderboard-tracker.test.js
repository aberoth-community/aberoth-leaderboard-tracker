import { LEADERBOARD_MORE_URL, LEADERBOARD_URL, createRange, fetchChampions, diffChampions } from '../index.js'

/**
 * Champions
 * @type {import("../aberoth-leaderboard-tracker.js").Champion[]}
 */
let champions

jest.setTimeout(10000)
beforeAll(async () => {
  champions = await fetchChampions(LEADERBOARD_URL)
})

describe('Fetch champions', () => {
  test('Should parse numbers', () => {
    expect(champions.some((c) => isNaN(c[1]))).toBe(false)
  })

  test('Names shouldn\'t include html tags', () => {
    expect(
      champions.some((c) => /<\/?[a-z][\s\S]*>/.test(c[0]))
    ).toBe(false)
  })

  test('Names should start with an uppercase', () => {
    expect(
      champions.some((c) => c[0].charAt(0).toUpperCase() !== c[0].charAt(0))
    ).toBe(false)
  })
})

describe('Create range', () => {
  test('1 should be "A"', () => {
    expect(createRange(1)).toBe('A')
  })
  test('26 should be "Z"', () => {
    expect(createRange(26)).toBe('Z')
  })
  test('27 should be "AA"', () => {
    expect(createRange(27)).toBe('AA')
  })
})

describe('Diff champions', () => {
  test('Should diff levels', () => {
    return diffChampions(champions, [['Ashnel', 215]])
      .then((champs) => {
        expect(champs.find((c) => c[0] === 'Ashnel')[1]).toBeGreaterThanOrEqual(0)
      })
  })
})
