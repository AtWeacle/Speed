import React from 'react'

const Button = ({
  appearance = 'normal',
  children,
  ...props
}: {
  appearance?: 'text' | 'normal' | 'outline',
  children: React.ReactNode,
  [key: string]: any,
}): JSX.Element => {
  return (
    <button
      className="Button"
      data-appearance={appearance}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
