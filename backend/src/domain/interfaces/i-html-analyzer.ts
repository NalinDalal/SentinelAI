export interface FormAnalysis {
  action: string | null;
  method: string;
  inputCount: number;
  passwordFieldCount: number;
  hiddenInputCount: number;
  hasExternalAction: boolean;
  hasSuspiciousAction: boolean;
  inputNames: string[];
  hasFileUpload: boolean;
}

export interface ScriptAnalysis {
  hasInlineScripts: boolean;
  hasObfuscatedCode: boolean;
  hasEval: boolean;
  hasDocumentWrite: boolean;
  hasExternalScripts: boolean;
  externalScriptDomains: string[];
  scriptCount: number;
  suspiciousPatterns: string[];
}

export interface IframeAnalysis {
  count: number;
  hasHiddenIframes: boolean;
  sources: string[];
  hasSuspiciousSources: boolean;
}

export interface HtmlAnalysisResult {
  hasHiddenInputs: boolean;
  hasPasswordFields: boolean;
  hasObfuscatedJavaScript: boolean;
  hasSuspiciousForms: boolean;
  hasExternalFormSubmissions: boolean;
  hasIframes: boolean;
  hasMetaRefresh: boolean;
  hasBase64Payloads: boolean;
  hasEncodedScripts: boolean;
  formAnalyses: FormAnalysis[];
  scriptAnalysis: ScriptAnalysis;
  iframeAnalysis: IframeAnalysis;
  riskScore: number;
  indicators: string[];
}

export interface IHtmlAnalyzer {
  analyze(html: string, url: string): Promise<HtmlAnalysisResult>;
}