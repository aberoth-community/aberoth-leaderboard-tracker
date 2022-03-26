#!/usr/bin/env node

import { google } from 'googleapis'
import { LEADERBOARD_MORE_URL, LEADERBOARD_URL, createRange, fetchChampions, googleLogin } from '../src/index.js'

// Main
;(async () => {
  const { GOOGLE_APPLICATION_CREDENTIALS, SHEET_ID } = process.env

  const googleAuth = await googleLogin(GOOGLE_APPLICATION_CREDENTIALS)
  const googleSheets = google.sheets({ version: 'v4', auth: googleAuth })

  /**
   * Get player names
   * @param {number} [len]
   * @returns {string[]}
   */
  const getNames = async (len) => {
    const resStored = await googleSheets.spreadsheets.values.get({
      auth: googleAuth,
      spreadsheetId: SHEET_ID,
      range: `Sheet1!A1:A${len}`
    })
    return resStored.data.values.map((s) => s[0])
  }

  /** Get first empty column
   * @return {string} Range string
   */
  const getColumnIndex = async () => {
    const resIndex = await googleSheets.spreadsheets.values.get({
      auth: googleAuth,
      spreadsheetId: SHEET_ID,
      // TODO: Get length of the sheet
      range: 'Sheet1!A1:Z1'
    })

    return typeof resIndex.data.values !== 'undefined'
      ? createRange(resIndex.data.values[0].length + 1)
      : 'A'
  }

  const index = await getColumnIndex()
  const names = await getNames(9999)
  const champs = await fetchChampions(LEADERBOARD_URL)

  await googleSheets.spreadsheets.values.append({
    auth: googleAuth,
    spreadsheetId: SHEET_ID,
    range: `Sheet1!${index}:${index}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: index === 'A'
        ? champs
        : champs
          .sort((a, b) => names.indexOf(a[0]) - names.indexOf(b[0]))
          .map((c) => [c[1]])
    }
  })
})()
