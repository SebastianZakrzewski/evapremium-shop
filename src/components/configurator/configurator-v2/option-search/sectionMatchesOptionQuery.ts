export const sectionMatchesOptionQuery = (
  title: string,
  terms: readonly string[],
  query: string,
): boolean => {
  const normalizedQuery = query.trim().toLocaleLowerCase("pl")
  if (!normalizedQuery) return true
  return [title, ...terms]
    .join("\n")
    .toLocaleLowerCase("pl")
    .includes(normalizedQuery)
}

export const countMatchingSections = (
  sections: readonly { title: string; terms: readonly string[] }[],
  query: string,
): number =>
  sections.filter((section) =>
    sectionMatchesOptionQuery(section.title, section.terms, query),
  ).length
