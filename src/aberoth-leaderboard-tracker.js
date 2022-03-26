import axios from 'axios'
import { google } from 'googleapis'
import { JSDOM } from 'jsdom'

// TODO: Fetch wealthiest?

// TODO: Check for name changes?

/**
 * Leaderboard player (name, level, diff?)
 * @typedef {[string, number, number?]} Champion
 */

/**
 * Create range character from number
 * Taken from: "https://stackoverflow.com/a/11090169"
 * @param {number} i
 * @returns {string}
 * @public
 */
export const range = (i) => {
  const mod = i % 26
  let pow = i / 26 | 0
  const out = mod ? String.fromCharCode(64 + mod) : (--pow, 'Z')
  return pow ? range(pow) + out : out
}

/**
 * Login to google apis
 * @param {string} [keyFile]                    - KeyFile name
 * @returns {google.auth.GoogleAuth.JSONClient} - Google client
 * @public
 */
export const googleLogin = async (keyFile = 'token.json') => {
  const auth = new google.auth.GoogleAuth({ keyFile, scopes: 'https://www.googleapis.com/auth/spreadsheets' })
  return await auth.getClient()
}

/**
* Get level difference
* @param {Champion[]} newChamps
* @param {Champion[]} oldChamps
* @returns {Champion[]}
* @public
*/
export const diffChampions = async (newChamps, oldChamps) => {
  return await Promise.all(
    newChamps.map(async (champ) => {
      const oldChamp = oldChamps.find((c) => c[0] === champ[0])
      return typeof oldChamp === 'undefined'
        ? champ
        : [...champ, oldChamp[1] - champ[1]]
    })
  )
}

/**
 * Fetch players from leaderboard
 * @param url
 * @returns {Promise<Champion[]>}
 * @public
 */
export const fetchChampions = async (url) => {
  const res = await axios.get(url)
  const dom = new JSDOM(res.data)
  const document = dom.window.document

  /**
   * Parse row
   * @param {HTMLTableRowElement} tr
   * @returns {Array<string, number>}
   */
  const parseTableRow = (tr) => {
    const [index, name, level] = Array.from(tr.childNodes).map((tb) => tb.innerHTML)
    return [name, parseInt(level, 10)]
  }

  return Promise.all(
    Array
      .from(document.querySelectorAll('table > tbody > tr'))
      .slice(1, -1)
      .map(async (e) => await parseTableRow(e))
  )
}
