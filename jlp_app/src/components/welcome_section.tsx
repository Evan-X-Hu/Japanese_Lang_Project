export function WelcomeSection() {
  return (
    <section className="flex flex-1 flex-col items-start justify-center px-6">
      <div className="mx-auto w-full max-w-3xl">
        <p className="mb-4 text-sm font-medium tracking-wider text-primary">
          JAPANESE LANGUAGE LEARNING
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl text-balance">
          Nihongo
        </h1>
        <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          A minimal application for Japanese language learning, powered by deep
          learning algorithms for intelligent data extraction and personalized
          study experiences.
        </p>

        <div className="border-l-2 border-border pl-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Getting Started
          </h2>
          <ul className="space-y-3 text-foreground">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>
                Explore vocabulary and kanji through intelligent categorization
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>
                Practice with spaced repetition powered by machine learning
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>Track your progress with detailed analytics and insights</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}