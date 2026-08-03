'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Scan } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download } from 'lucide-react';
import { useState } from 'react';

export default function HistoryPage() {
  const [status, setStatus] = useState('');
  const [verdict, setVerdict] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['history', status, verdict, search, page],
    queryFn: () =>
      api
        .get(
          `/history?status=${status}&verdict=${verdict}&search=${search}&page=${page}&limit=20`,
        )
        .then((r) => r.data),
  });

  const handleExport = async (format: string) => {
    const response = await api.get(`/history/export?format=${format}`);
    const blob = new Blob([JSON.stringify(response.data.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scan History</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search URLs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CRAWLING">Crawling</SelectItem>
            <SelectItem value="ANALYZING">Analyzing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={verdict} onValueChange={setVerdict}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Verdicts</SelectItem>
            <SelectItem value="safe">Safe</SelectItem>
            <SelectItem value="suspicious">Suspicious</SelectItem>
            <SelectItem value="phishing">Phishing</SelectItem>
            <SelectItem value="high-risk">High Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                data?.data?.map((scan: Scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="max-w-[300px] truncate">{scan.url}</TableCell>
                    <TableCell>{scan.domain}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{scan.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${scan.riskScore}%`,
                              backgroundColor:
                                scan.riskScore > 70
                                  ? '#ef4444'
                                  : scan.riskScore > 40
                                    ? '#f59e0b'
                                    : '#22c55e',
                            }}
                          />
                        </div>
                        <span className="text-sm">{scan.riskScore}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          scan.verdict === 'phishing' || scan.verdict === 'high-risk'
                            ? 'destructive'
                            : scan.verdict === 'suspicious'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {scan.verdict}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(scan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/scan/${scan.id}`}>View</a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Total: {data.pagination.total} results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}