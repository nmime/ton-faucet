export const convertChars = (str: string) => {
  const chars = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }

  return str.replace(/[<>&]/g, s => {
    // @ts-ignore
    return chars[s]
  })
}
