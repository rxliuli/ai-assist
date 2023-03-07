import { it } from 'vitest'
import { translate } from '..'

it('translate', async () => {
  const start = Date.now()
  const r = await translate({
    text: '在经历了几个世纪的动荡之后，一个乌托邦式的 AI— 人类政府治理着地球，预示着后稀缺社会的来临和太空殖民的新时代。一次意外的接触却让科技更先进的敌对外星种族打破了和平，这迫使魔法少女们走出幕后，拯救人类文明。在这一切之中，志筑良子，一个普通的女孩，仰望着星空，好奇着她在宇宙中的归所。 “丘比承诺说人类总有一天也能到达那遥远的星空。但它们很明智地没有说出来，人类将会在那里遇到什么。”—— 引言',
    from: 'zh-cn',
    to: 'en',
  })
  console.log('time', Date.now() - start)
  console.log(r)
}, 30_000)
