import { Injectable } from '@nestjs/common';
import { IUrlAnalyzer, UrlAnalysisResult } from '../../domain/interfaces/i-url-analyzer';
import validator from 'validator';

@Injectable()
export class UrlAnalyzerService implements IUrlAnalyzer {
  private readonly suspiciousTlds = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club',
    '.online', '.site', '.stream', '.tech', '.download', '.click',
    '.link', '.win', '.date', '.faith', '.loan', '.gives',
  ];

  private readonly suspiciousKeywords = [
    'verify', 'login', 'account', 'update', 'secure', 'bank',
    'password', 'confirm', 'suspended', 'action', 'required',
    'immediate', 'urgent', 'verify-now', 'click-here', 'free',
    'winner', 'prize', 'claim', 'authenticate', 'credentials',
  ];

  async analyze(url: string): Promise<UrlAnalysisResult> {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathname = parsed.pathname;
    const searchParams = parsed.searchParams;

    const isIpAddress = this.isIpAddress(hostname);
    const isUrlShortened = this.isUrlShortened(url);
    const hasSuspiciousTld = this.hasSuspiciousTld(hostname);
    const hasRandomString = this.hasRandomString(hostname);
    const hasExcessiveSymbols = this.hasExcessiveSymbols(url);
    const hasSuspiciousKeywords = this.hasSuspiciousKeywords(url);
    const subdomainCount = this.countSubdomains(hostname);
    const pathDepth = pathname.split('/').filter(Boolean).length;
    const queryParamCount = searchParams.size;
    const urlLength = url.length;
    const entropy = this.calculateEntropy(hostname);
    const tldRiskScore = this.calculateTldRisk(hostname);

    const indicators: string[] = [];
    let riskScore = 0;

    if (isIpAddress) {
      indicators.push('URL uses IP address instead of domain name');
      riskScore += 15;
    }

    if (urlLength > 100) {
      indicators.push('URL is excessively long');
      riskScore += 10;
    }

    if (subdomainCount > 3) {
      indicators.push('URL has excessive subdomains');
      riskScore += 10;
    }

    if (hasSuspiciousTld) {
      indicators.push('URL uses a suspicious TLD');
      riskScore += 10;
    }

    if (isUrlShortened) {
      indicators.push('URL uses a URL shortening service');
      riskScore += 15;
    }

    if (hasRandomString) {
      indicators.push('URL contains random character strings');
      riskScore += 10;
    }

    if (hasExcessiveSymbols) {
      indicators.push('URL contains excessive special characters');
      riskScore += 10;
    }

    if (hasSuspiciousKeywords) {
      indicators.push('URL contains suspicious keywords');
      riskScore += 15;
    }

    if (pathDepth > 5) {
      indicators.push('URL has deep path structure');
      riskScore += 5;
    }

    if (queryParamCount > 5) {
      indicators.push('URL has excessive query parameters');
      riskScore += 5;
    }

    if (entropy > 4.5) {
      indicators.push('URL has high entropy, suggesting obfuscation');
      riskScore += 10;
    }

    riskScore = Math.min(riskScore, 100);

    return {
      url,
      domain: hostname,
      subdomainCount,
      pathDepth,
      queryParamCount,
      isIpAddress,
      isUrlShortened,
      hasSuspiciousTld,
      hasRandomString,
      hasExcessiveSymbols,
      hasSuspiciousKeywords,
      tldRiskScore,
      urlLength,
      entropy,
      riskScore,
      indicators,
    };
  }

  private isIpAddress(hostname: string): boolean {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  }

  private isUrlShortened(url: string): boolean {
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co', 'is.gd', 'buff.ly', 'shorte.st'];
    return shorteners.some((s) => url.includes(s));
  }

  private hasSuspiciousTld(hostname: string): boolean {
    const tld = '.' + hostname.split('.').pop();
    return this.suspiciousTlds.includes(tld);
  }

  private hasRandomString(hostname: string): boolean {
    const parts = hostname.split('.');
    const domain = parts[parts.length - 2];
    const randomPattern = /^[a-z0-9]{12,}$/i;
    return randomPattern.test(domain) && !this.isCommonWord(domain);
  }

  private hasExcessiveSymbols(url: string): boolean {
    const specialChars = url.match(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g);
    return specialChars !== null && specialChars.length > 10;
  }

  private hasSuspiciousKeywords(url: string): boolean {
    const lowerUrl = url.toLowerCase();
    return this.suspiciousKeywords.some((keyword) => lowerUrl.includes(keyword));
  }

  private countSubdomains(hostname: string): number {
    return hostname.split('.').length - 2;
  }

  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    const len = str.length;
    let entropy = 0;
    for (const char in freq) {
      const p = freq[char] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  private calculateTldRisk(hostname: string): number {
    const tld = '.' + hostname.split('.').pop();
    if (this.suspiciousTlds.includes(tld)) return 0.8;
    if (hostname.endsWith('.com') || hostname.endsWith('.org')) return 0.1;
    return 0.3;
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['google', 'amazon', 'microsoft', 'apple', 'facebook', 'twitter', 'github', 'paypal', 'bank', 'login', 'secure', 'account', 'verify', 'update', 'support', 'service', 'portal', 'admin', 'webmail', 'mail', 'email', 'cloud', 'store', 'shop', 'payment', 'auth', 'signin', 'signup', 'register', 'reset', 'password'];
    return commonWords.includes(word.toLowerCase());
  }
}