import Image from 'next/image'

export default function NotFoundChecklists() {
  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <img src="/not-found.svg" alt="not-found" className="w-200" />

        <h3 className="mt-4 text-lg font-semibold">No checklists found</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any checklists.
        </p>
      </div>
    </div>
  )
}
