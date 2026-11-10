/** Marketing frames such as "3D JĘZOR" must not enter the configurator gallery. */
export const isMarketingConfiguratorImage = (src: string): boolean => {
  const value = src.toLowerCase()
  return (
    value.includes("/zrantamiprodukt/") ||
    value.includes("/bezrantowprodukt/") ||
    value.includes("/konfigurator/zestaw/")
  )
}
