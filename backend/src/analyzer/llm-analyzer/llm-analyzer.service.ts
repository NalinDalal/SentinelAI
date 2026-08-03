import { Injectable } from '@nestjs/common';
import { ILlmAnalyzer, LlmAnalysisInput, LlmAnalysisResult } from '../../domain/interfaces/i-llm-analyzer';

@Injectable()
export class LlmAnalyzerService implements ILlmAnalyzer {
  async analyze(input: LlmAnalysisInput): Promise<LlmAnalysisResult> {
    const prompt = this.buildPrompt(input);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return this.getFallbackResult(input);
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const parsed = this.parseLlmResponse(text);
      return parsed;
    } catch {
      return this.getFallbackResult(input);
    }
  }

  private buildPrompt(input: LlmAnalysisInput): string {
    return `Analyze the following website for phishing. Return ONLY a valid JSON object with no markdown, no explanation, no extra text.

Website URL: ${input.url}
Domain: ${input.urlAnalysis?.domain}
SSL Valid: ${input.sslInfo?.valid}
Redirect Chain: ${JSON.stringify(input.redirectChain)}
Page Title: ${input.metadata?.title}

URL Analysis: ${JSON.stringify(input.urlAnalysis)}
HTML Analysis: ${JSON.stringify(input.htmlAnalysis)}
OCR Text: ${input.ocrResult?.text?.substring(0, 2000)}
Brand Detection: ${JSON.stringify(input.brandDetection)}

Based on this data, classify the website and provide:
1. classification: "phishing", "suspicious", "legitimate", or "unknown"
2. confidence: 0-1
3. risk_score: 0-100
4. explanation: brief explanation
5. reasons: array of reasons
6. detected_patterns: array of patterns found
7. recommended_action: "allow", "warn", "block"

Return ONLY the JSON object.`;
  }

  private parseLlmResponse(text: string): LlmAnalysisResult {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fall through
    }
    return this.getFallbackResult({} as LlmAnalysisInput);
  }

  private getFallbackResult(input: LlmAnalysisInput): LlmAnalysisResult {
    const urlRisk = input.urlAnalysis?.riskScore ?? 0;
    const htmlRisk = input.htmlAnalysis?.riskScore ?? 0;
    const brandRisk = input.brandDetection?.riskScore ?? 0;
    const ocrRisk = input.ocrResult?.riskScore ?? 0;

    const combinedRisk = (urlRisk + htmlRisk + brandRisk + ocrRisk) / 4;

    let classification: LlmAnalysisResult['classification'] = 'unknown';
    if (combinedRisk > 60) classification = 'phishing';
    else if (combinedRisk > 30) classification = 'suspicious';
    else if (combinedRisk > 10) classification = 'legitimate';

    return {
      classification,
      confidence: Math.max(0.1, 1 - combinedRisk / 100),
      riskScore: combinedRisk,
      explanation: 'Automated analysis based on heuristic and pattern matching',
      reasons: ['Analysis completed with limited LLM availability'],
      detectedPatterns: [],
      recommendedAction: combinedRisk > 60 ? 'block' : combinedRisk > 30 ? 'warn' : 'allow',
    };
  }
}