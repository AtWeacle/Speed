import { TextareaHTMLAttributes } from 'react'

const Textarea = ({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => {
  return <textarea className={`Textarea ${className}`} {...props} />
}

export default Textarea
