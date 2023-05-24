interface GenerateImageArgs {
  width: number
  height?: number
  id?: number
  seed?: string
  grayscale?: boolean
  blur?: boolean | number
  ext?: 'jpg' | 'webp'
}

/**
 * 生成随机图片的 url
 * @example https://picsum.photos/200/300
 * @example https://picsum.photos/200
 * @example https://picsum.photos/id/237/200/300
 * @example https://picsum.photos/seed/picsum/200/300
 * @example https://picsum.photos/200/300?grayscale
 * @example https://picsum.photos/200/300/?blur
 * @example https://picsum.photos/200/300/?blur=2
 * @example https://picsum.photos/id/870/200/300?grayscale&blur=2
 * @example https://picsum.photos/200/300.jpg
 * @example https://picsum.photos/200/300.webp
 * @param url
 * @param args
 */
export function generateUrl(args: GenerateImageArgs) {
  const { width, height, id, seed, grayscale, blur, ext } = args

  if (id && seed) {
    throw new Error('The "id" and "seed" parameters cannot be used together.')
  }

  let url = `https://picsum.photos/${id ? `id/${id}/` : ''}${seed ? `seed/${seed}/` : ''}${width}/${height ?? width}`

  const params = []
  if (grayscale) params.push('grayscale')
  if (blur === true) params.push('blur')
  if (typeof blur === 'number') params.push(`blur=${blur}`)

  if (params.length > 0) url += `?${params.join('&')}`
  if (ext) url += `.${ext}`

  return url
}
