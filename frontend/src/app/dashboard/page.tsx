'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats, TrendPoint, TopDomain } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/overview').then((r) => r.data.data),
  });

  const { data: trend } = useQuery<TrendPoint[]>({
    queryKey: ['dashboard-trend'],
    queryFn: () => api.get('/dashboard/trend?days=30').then((r) => r.data.data),
  });

  const { data: topDomains } = useQuery<TopDomain[]>({
    queryKey: ['dashboard-top-domains'],
    queryFn: () => api.get('/dashboard/top-domains?limit=10').then((r) => r.data.data),
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Scans" value={stats?.totalScans ?? 0} icon={Activity} />
        <StatCard title="Phishing Detected" value={stats?.phishingCount ?? 0} icon={Shield} variant="danger" />
        <StatCard title="Suspicious" value={stats?.suspiciousCount ?? 0} icon={AlertTriangle} variant="warning" />
        <StatCard title="Safe" value={stats?.safeCount ?? 0} icon={CheckCircle} variant="success" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="riskScore" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verdict Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                    { name: 'Safe', value: stats?.safeCount ?? 0, color: '#22c55e' },
                    { name: 'Suspicious', value: stats?.suspiciousCount ?? 0, color: '#f59e0b' },
                    { name: 'Phishing', value: stats?.phishingCount ?? 0, color: '#ef4444' },
                  ]}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  >
                    {[
                      { name: 'Safe', value: stats?.safeCount ?? 0, color: '#22c55e' },
                      { name: 'Suspicious', value: stats?.suspiciousCount ?? 0, color: '#f59e0b' },
                      { name: 'Phishing', value: stats?.phishingCount ?? 0, color: '#ef4444' },
                    ].map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Risky Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDomains}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avgRiskScore" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, variant = 'default' }: { title: string; value: number; icon: any; variant?: 'default' | 'danger' | 'warning' | 'success' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${variant === 'danger' ? 'bg-danger/10' : variant === 'warning' ? 'bg-warning/10' : variant === 'success' ? 'bg-success/10' : 'bg-primary/10'}`}>
            <Icon className={`h-6 w-6 ${variant === 'danger' ? 'text-danger' : variant === 'warning' ? 'text-warning' : variant === 'success' ? 'text-success' : 'text-primary'}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}