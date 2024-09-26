import Fuse from 'fuse.js'
import { normalizeString } from '../utils/stringUtils'

export const matchHeader = (excelHeader, dbHeaders) => {
  if (!Array.isArray(dbHeaders)) {
    console.error('dbHeaders is not an array:', dbHeaders)
    return null
  }

  const options = {
    includeScore: true,
    threshold: 0.3
  }

  const normalizedExcelHeader = normalizeString(excelHeader)
  const normalizedDbHeaders = dbHeaders.map((header) => ({
    original: header,
    normalized: normalizeString(header)
  }))

  const fuse = new Fuse(normalizedDbHeaders, { keys: ['normalized'], ...options })
  const result = fuse.search(normalizedExcelHeader)

  if (result.length > 0 && result[0].score < 0.1) {
    return result[0].item.original
  } else {
    return null
  }
}

export const suggestHeaders = (inputValue, dbHeaders) => {
  if (!Array.isArray(dbHeaders)) {
    console.error('dbHeaders is not an array:', dbHeaders)
    return []
  }

  const options = { includeScore: true, threshold: 0.3 }
  const fuse = new Fuse(dbHeaders, options)
  const result = fuse.search(normalizeString(inputValue))
  return result.map((r) => r.item)
}
