import fs from 'fs'

const env = fs.readFileSync('.env', 'utf8')
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim()
const base =
  get('BITRIX24_WEBHOOK_URL') ||
  get('BITRIX24_WEBHOOK') ||
  get('NEXT_PUBLIC_BITRIX24_WEBHOOK_URL')

if (!base) {
  console.error('Missing Bitrix webhook URL')
  process.exit(1)
}

const dealId = process.argv[2] || '49368'
const endpoint = `${base.replace(/\/$/, '')}/crm.deal.get.json?ID=${dealId}`
const res = await fetch(endpoint)
const json = await res.json()
console.log(
  JSON.stringify(
    {
      id: json.result?.ID,
      title: json.result?.TITLE,
      stage: json.result?.STAGE_ID,
      category: json.result?.CATEGORY_ID,
      origin: json.result?.ORIGIN_ID,
      opportunity: json.result?.OPPORTUNITY,
    },
    null,
    2
  )
)
