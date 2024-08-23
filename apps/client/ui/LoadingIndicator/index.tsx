import { FC, CSSProperties } from 'react'

interface LoaderProps {
  color?: string
  loaderStyle?: CSSProperties
  noWrapper?: boolean
  size?: number | string
  strokeWidth?: number
  style?: CSSProperties
}

const LoadingIndicator: FC<LoaderProps> = ({ noWrapper = false, ...props }) => {
  if (noWrapper) return Loader(props)

  return (
    <div data-component="loader-spinner-wrapper" style={{ width: props.size || '54px' }}>
      {Loader(props)}
    </div>
  )
}

function Loader({
  color = 'var(--c-colors-deepblack)',
  loaderStyle = {},
  size = '54px',
  strokeWidth = 3,
  style = {},
}: LoaderProps) {

  return (
    <div data-component="loader-spinner" style={style}>
      <svg
        style={loaderStyle}
        height={size}
        width={size}
        viewBox="0 0 50 50"
        className="loader-spinner"
      >
        <circle
          strokeWidth={strokeWidth}
          stroke={color.includes('var(') ? color : `var(--c-colors-${color})`}
          cx="25"
          cy="25"
          r="20"
        />
      </svg>
    </div>
  )
}

export default LoadingIndicator
