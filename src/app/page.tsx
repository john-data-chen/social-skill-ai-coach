import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="flex flex-col gap-6 items-center max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Social Skills AI Coach</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          An AI social skills coach that helps you analyze social situations, provides advice, and
          conducts roleplay exercises.
        </p>

        <Card className="w-full mt-4">
          <CardHeader>
            <CardTitle>Environment Ready</CardTitle>
            <CardDescription>App Router + Tailwind 4 + Shadcn UI</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button variant="default">Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
