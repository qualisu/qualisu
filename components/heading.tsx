interface HeadingProps {
  title: string
  description: string
  icon: React.ReactNode
}

const Heading = ({ title, description, icon }: HeadingProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export default Heading
