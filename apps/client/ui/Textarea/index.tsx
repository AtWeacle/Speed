import { TextareaHTMLAttributes } from 'react'

import '@weacle/speed-client/ui/Textarea/styles.css'

const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => {
  return <textarea className={`Textarea ${className}`} {...props} />
}

export default Textarea
