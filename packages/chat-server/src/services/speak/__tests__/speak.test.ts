import { expect, it } from 'vitest'
import { getRegionAndToken } from '..'

it('getRegionAndToken', async () => {
  const r = await getRegionAndToken()
  console.log(r)
  expect(r.token).toBeTypeOf('string')
})
