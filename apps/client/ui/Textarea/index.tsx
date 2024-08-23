import '@weacle/speed-client/ui/Textarea/styles.css'

const Textarea = ({ children, ...props }: {
  children: React.ReactNode,
  [key: string]: any,
}): JSX.Element => {
  return (
    <textarea className="Textarea" {...props}>{children}</textarea>
  )
}

export default Textarea
