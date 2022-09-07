export function truncateStr(fullStr, strLen) {
    if (fullStr.length <= strLen) return fullStr

    const seperator = "..."
    let seperatorLength = seperator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 3)
    return (
        fullStr.substring(0, frontChars) + seperator + fullStr.substring(fullStr.length - backChars)
    )
}
