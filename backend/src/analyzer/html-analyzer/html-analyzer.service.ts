import { Injectable } from '@nestjs/common';
import { IHtmlAnalyzer, HtmlAnalysisResult } from '../../domain/interfaces/i-html-analyzer';

@Injectable()
export class HtmlAnalyzerService implements IHtmlAnalyzer {
  async analyze(html: string, url: string): Promise<HtmlAnalysisResult> {
    const formAnalyses = this.analyzeForms(html);
    const scriptAnalysis = this.analyzeScripts(html);
    const iframeAnalysis = this.analyzeIframes(html);

    const hasHiddenInputs = /<input[^>]*type=["']hidden["'][^>]*>/i.test(html);
    const hasPasswordFields = /<input[^>]*type=["']password["'][^>]*>/i.test(html);
    const hasSuspiciousForms = formAnalyses.some(
      (f) => f.hasSuspiciousAction || f.hasExternalAction,
    );
    const hasExternalFormSubmissions = formAnalyses.some(
      (f) => f.hasExternalAction,
    );
    const hasMetaRefresh = /<meta[^>]*http-equiv=["']refresh["'][^>]*>/i.test(html);
    const hasBase64Payloads = /base64[^,]*[A-Za-z0-9+/]{50,}=*/i.test(html);
    const hasEncodedScripts = /eval\s*\(|document\.write\s*\(|atob\s*\(/i.test(html);

    const indicators: string[] = [];
    let riskScore = 0;

    if (hasHiddenInputs) {
      indicators.push('Hidden input fields detected');
      riskScore += 5;
    }

    if (hasPasswordFields) {
      indicators.push('Password fields detected');
      riskScore += 10;
    }

    if (hasSuspiciousForms) {
      indicators.push('Suspicious form actions detected');
      riskScore += 15;
    }

    if (hasExternalFormSubmissions) {
      indicators.push('Forms submit to external domains');
      riskScore += 15;
    }

    if (hasMetaRefresh) {
      indicators.push('Meta refresh redirect detected');
      riskScore += 10;
    }

    if (hasBase64Payloads) {
      indicators.push('Base64 encoded content detected');
      riskScore += 10;
    }

    if (hasEncodedScripts) {
      indicators.push('Obfuscated JavaScript patterns detected');
      riskScore += 15;
    }

    if (iframeAnalysis.hasHiddenIframes) {
      indicators.push('Hidden iframes detected');
      riskScore += 15;
    }

    if (scriptAnalysis.hasObfuscatedCode) {
      indicators.push('Obfuscated JavaScript code detected');
      riskScore += 10;
    }

    if (scriptAnalysis.hasEval) {
      indicators.push('eval() usage detected in scripts');
      riskScore += 10;
    }

    riskScore = Math.min(riskScore, 100);

    return {
      hasHiddenInputs,
      hasPasswordFields,
      hasObfuscatedJavaScript: scriptAnalysis.hasObfuscatedCode,
      hasSuspiciousForms,
      hasExternalFormSubmissions,
      hasIframes: iframeAnalysis.count > 0,
      hasMetaRefresh,
      hasBase64Payloads,
      hasEncodedScripts,
      formAnalyses,
      scriptAnalysis,
      iframeAnalysis,
      riskScore,
      indicators,
    };
  }

  private analyzeForms(html: string) {
    const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
    const forms: any[] = [];
    let match;

    while ((match = formRegex.exec(html)) !== null) {
      const formHtml = match[0];
      const actionMatch = formHtml.match(/action=["']([^"']*)["']/i);
      const methodMatch = formHtml.match(/method=["']([^"']*)["']/i);
      const action = actionMatch ? actionMatch[1] : null;
      const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

      const inputRegex = /<input[^>]*>/gi;
      const inputs = formHtml.match(inputRegex) || [];
      const passwordFields = inputs.filter((i: string) => /type=["']password["']/i.test(i));
      const hiddenInputs = inputs.filter((i: string) => /type=["']hidden["']/i.test(i));
      const fileInputs = inputs.filter((i: string) => /type=["']file["']/i.test(i));

      const hasExternalAction = action !== null && !this.isSameDomain(action);
      const hasSuspiciousAction = action !== null && /['"]javascript:/i.test(action);

      forms.push({
        action,
        method,
        inputCount: inputs.length,
        passwordFieldCount: passwordFields.length,
        hiddenInputCount: hiddenInputs.length,
        hasExternalAction,
        hasSuspiciousAction,
        inputNames: this.extractInputNames(inputs),
        hasFileUpload: fileInputs.length > 0,
      });
    }

    return forms;
  }

  private analyzeScripts(html: string) {
    const hasInlineScripts = /<script[^>]*>[^<]*<\/script>/i.test(html);
    const hasObfuscatedCode = /(eval|Function|setTimeout|setInterval)\s*\(\s*['"][^"']{50,}['"]/i.test(html);
    const hasEval = /eval\s*\(/i.test(html);
    const hasDocumentWrite = /document\.write\s*\(/i.test(html);
    const externalScriptRegex = /<script[^>]*src=["']([^"']*)["'][^>]*>/gi;
    const externalScripts: string[] = [];
    let extMatch;
    while ((extMatch = externalScriptRegex.exec(html)) !== null) {
      externalScripts.push(extMatch[1]);
    }

    const suspiciousPatterns = [
      'document.cookie',
      'document.location',
      'window.location',
      'eval(',
      'Function(',
      'atob(',
      'atob(',
    ];
    const foundPatterns = suspiciousPatterns.filter((p) => html.includes(p));

    return {
      hasInlineScripts,
      hasObfuscatedCode,
      hasEval,
      hasDocumentWrite,
      hasExternalScripts: externalScripts.length > 0,
      externalScriptDomains: this.extractDomains(externalScripts),
      scriptCount: (html.match(/<script/gi) || []).length,
      suspiciousPatterns: foundPatterns,
    };
  }

  private analyzeIframes(html: string) {
    const iframeRegex = /<iframe[^>]*>/gi;
    const iframes = html.match(iframeRegex) || [];
    const srcRegex = /src=["']([^"']*)["']/i;
    const sources: string[] = [];
    let srcMatch;
    const iframeRegex2 = /<iframe[^>]*>/gi;
    let iframeMatch;
    while ((iframeMatch = iframeRegex2.exec(html)) !== null) {
      const src = iframeMatch[0].match(srcRegex);
      if (src) sources.push(src[1]);
    }

    const hasHiddenIframes = iframes.some(
      (f) => /width=["']0["']|height=["']0["']|style=["'][^"']*display\s*:\s*none/i.test(f),
    );
    const hasSuspiciousSources = sources.some((s) => !this.isSameDomain(s) && s !== '');

    return {
      count: iframes.length,
      hasHiddenIframes,
      sources,
      hasSuspiciousSources,
    };
  }

  private isSameDomain(url: string): boolean {
    return true;
  }

  private extractInputNames(inputs: string[]): string[] {
    return inputs
      .map((i) => {
        const nameMatch = i.match(/name=["']([^"']*)["']/i);
        return nameMatch ? nameMatch[1] : null;
      })
      .filter(Boolean) as string[];
  }

  private extractDomains(urls: string[]): string[] {
    return urls
      .map((u) => {
        try {
          return new URL(u).hostname;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as string[];
  }
}