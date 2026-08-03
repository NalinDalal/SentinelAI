import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, ScanLine, BarChart3, History } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SentinelAI</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/scan" className="text-sm font-medium hover:underline">
              Scan
            </Link>
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/auth/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              AI-Powered Phishing Detection
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Analyze any website with multiple independent analysis engines. Get instant,
              explainable phishing verdicts powered by AI.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/scan">
              <Button size="lg" className="text-lg px-8">
                Start a Scan
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <FeatureCard
              icon={<ScanLine className="h-8 w-8" />}
              title="Deep Analysis"
              description="Crawl, screenshot, OCR, and analyze every aspect of a website using multiple engines."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="AI-Powered Detection"
              description="LLM reasoning combined with heuristic analysis for accurate phishing detection."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Explainable Reports"
              description="Get detailed risk breakdowns, indicators, and actionable recommendations."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}