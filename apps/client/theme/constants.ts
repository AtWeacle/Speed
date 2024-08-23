export const MEDIA_INITIAL = '@media (min-width: 0px)'
export const MEDIA_XS = '@media (min-width: 520px)'
export const MEDIA_SM = '@media (min-width: 768px)'
export const MEDIA_MD = '@media (min-width: 1024px)'
export const MEDIA_LG = '@media (min-width: 1280px)'
export const MEDIA_XL = '@media (min-width: 1640px)'

export interface MediaBreakpoints {
  INITIAL: typeof MEDIA_INITIAL
  XS: typeof MEDIA_XS
  SM: typeof MEDIA_SM
  MD: typeof MEDIA_MD
  LG: typeof MEDIA_LG
  XL: typeof MEDIA_XL
}

/**
* XS: 520px | SM: 768px | MD: 1024px | LG: 1280px | XL: 1640px
*/
export const MEDIA: MediaBreakpoints = {
  INITIAL: MEDIA_INITIAL,
  XS: MEDIA_XS,
  SM: MEDIA_SM,
  MD: MEDIA_MD,
  LG: MEDIA_LG,
  XL: MEDIA_XL,
}
