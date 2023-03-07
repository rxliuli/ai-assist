import { sortBy } from 'lodash-es'
import { it } from 'vitest'

const list = [
  '2023-03-07T03:26:40.465Z',
  '2023-03-07T03:08:16.731Z',
  '2023-03-07T03:08:44.928Z',
  '2023-03-07T03:08:44.101Z',
  '2023-03-07T03:26:44.858Z',
  '2023-03-07T03:08:18.715Z',
]

it('sort', () => {
  console.log(sortBy(list))
})
