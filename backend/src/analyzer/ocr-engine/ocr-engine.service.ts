import { Injectable } from '@nestjs/common';
import { IOcrEngine, OcrResult } from '../../domain/interfaces/i-ocr-engine';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrEngineService implements IOcrEngine {
  async extractText(imageBuffer: Buffer): Promise<OcrResult> {
    const result = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: () => {},
    });

    const text = result.data.text;
    const confidence = result.data.confidence;
    const suspiciousPhrases = this.detectSuspiciousPhrases(text);

    let riskScore = 0;
    if (suspiciousPhrases.length > 0) {
      riskScore += Math.min(suspiciousPhrases.length * 10, 50);
    }
    if (confidence < 50) {
      riskScore += 10;
    }

    return {
      text,
      confidence,
      language: result.data.lang,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      suspiciousPhrases,
      riskScore,
    };
  }

  private detectSuspiciousPhrases(text: string): string[] {
    const lowerText = text.toLowerCase();
    const suspicious = [
      'verify your account',
      'click the link below',
      'urgent action required',
      'your account will be suspended',
      'unauthorized login attempt',
      'confirm your identity',
      'update your password',
      'verify your payment',
      'claim your prize',
      'account suspended',
      'immediate action required',
      'verify now',
      'login to verify',
      'suspicious activity',
      'security alert',
      'confirm your credentials',
      'enter your password',
      'bank verification',
      'tax refund',
      'package delivery',
      'your order',
      'payment failed',
      'click here to verify',
      'verify your email',
    ];

    return suspicious.filter((phrase) => lowerText.includes(phrase));
  }
}