interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line bg-surface px-4 py-5 sm:px-6">
        <h1 className="text-xl font-extrabold tracking-tight text-ink">{title}</h1>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-sm text-sm text-ink-faint">{description}</p>
      </div>
    </div>
  )
}
