'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

const scanSchema = z.object({
  url: z.string().url('Invalid URL').min(1, 'URL is required'),
});

type ScanFormData = z.infer<typeof scanSchema>;

export default function ScanPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ScanFormData>({
    resolver: zodResolver(scanSchema),
  });

  const onSubmit = async (data: ScanFormData) => {
    try {
      const response = await api.post<{ data: { id: string; url: string; message: string } }>('/scan', data);
      const scanId = response.data.id;
      router.push(`/scan/${scanId}`);
    } catch (error: any) {
      toast({
        title: 'Scan failed',
        description: error.response?.data?.message || 'Failed to start scan',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">New Scan</CardTitle>
          <CardDescription>Enter a URL to analyze for phishing threats</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input id="url" placeholder="https://example.com" {...register('url')} />
              {errors.url && <p className="text-sm text-danger">{errors.url.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Analyzing...' : 'Start Scan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}