export const sectionHeaderMatchesQuery = (
  title: string,
  query: string,
): boolean => {
  const normalizedQuery = query.trim().toLocaleLowerCase("pl")
  if (!normalizedQuery) return true
  return title.toLocaleLowerCase("pl").includes(normalizedQuery)
}
