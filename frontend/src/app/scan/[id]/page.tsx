'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ScanResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScan = async () => {
      try {
        const response = await api.get(`/scan/${params.id}`);
        setScan(response.data.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
    const interval = setInterval(fetchScan, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading && !scan) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Scan not found</p>
        <Button onClick={() => router.push('/scan')} variant="outline" className="mt-4">
          Back to Scan
        </Button>
      </div>
    );
  }

  const verdictColors = {
    safe: 'bg-success text-success-foreground',
    suspicious: 'bg-warning text-warning-foreground',
    phishing: 'bg-danger text-danger-foreground',
    'high-risk': 'bg-danger text-danger-foreground',
  };

  const verdictIcons = {
    safe: <CheckCircle className="h-12 w-12 text-success" />,
    suspicious: <AlertTriangle className="h-12 w-12 text-warning" />,
    phishing: <XCircle className="h-12 w-12 text-danger" />,
    'high-risk': <XCircle className="h-12 w-12 text-danger" />,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Scan Result</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {verdictIcons[scan.verdict as keyof typeof verdictIcons] || <Shield className="h-12 w-12" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold">{scan.title || scan.url}</h2>
                <Badge className={verdictColors[scan.verdict as keyof typeof verdictColors] || 'bg-muted'}>
                  {scan.verdict?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{scan.url}</p>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <p className="text-2xl font-bold">{scan.riskScore}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">{(scan.confidence * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize">{scan.status}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {scan.riskScore > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={scan.riskScore} className="h-4" />
            <p className="mt-2 text-sm text-muted-foreground">{scan.recommendation}</p>
          </CardContent>
        </Card>
      )}

      {scan.llmResponse && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Explanation</h4>
              <p className="text-sm">{(scan.llmResponse as any).explanation}</p>
            </div>
            {(scan.llmResponse as any).reasons && (
              <div>
                <h4 className="font-semibold mb-2">Reasons</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {(scan.llmResponse as any).reasons.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {(scan.llmResponse as any).detectedPatterns && (
              <div>
                <h4 className="font-semibold mb-2">Detected Patterns</h4>
                <div className="flex flex-wrap gap-2">
                  {(scan.llmResponse as any).detectedPatterns.map((p: string, i: number) => (
                    <Badge key={i} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {scan.screenshotUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshot</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={scan.screenshotUrl} alt="Website screenshot" className="rounded-lg border max-w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}