export default async function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-black">
          <img
            src="/isuzu-fabrika.jpeg"
            alt=""
            className="object-cover h-full opacity-75"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.png" alt="logo" width={100} height={100} />
          Qualisu
        </div>
      </div>
      {children}
    </div>
  )
}
