import { TextareaHTMLAttributes } from 'react'

import '@weacle/speed-client/ui/Textarea/styles.css'

const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => {
  return <textarea className="Textarea" {...props} />
}

export default Textarea
