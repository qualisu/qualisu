interface HeaderProps {
  header?: string
  label: string
}

export const Header = ({ header, label }: HeaderProps) => {
  return (
    <div className="grid gap-2 text-center">
      <h1 className="text-3xl font-bold">{header}</h1>
      <p className="text-balance text-muted-foreground">{label}</p>
    </div>
  )
}
