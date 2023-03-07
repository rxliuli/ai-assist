export async function getRegionAndToken() {
  const resp = await fetch(
    `https://${process.env.AZURE_COGNITIVE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    {
      method: 'post',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.AZURE_COGNITIVE_KEY!,
      },
    },
  )
  const r = await resp.text()
  return {
    region: process.env.AZURE_COGNITIVE_REGION,
    token: r,
  }
}
