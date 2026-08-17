export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  onEnd?: () => void;
  onStart?: () => void;
}

const IGNORED_ERRORS = new Set(['canceled', 'interrupted', '']);

class TextToSpeechService {
  private synth: SpeechSynthesis | null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private voicesReady: Promise<void> | null = null;
  private speaking = false;
  private paused = false;
  private lastText = '';
  private lastOptions: SpeakOptions = {};

  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  }

  isSupported(): boolean {
    return this.synth !== null;
  }

  isSpeaking(): boolean {
    return this.speaking;
  }

  isPausedState(): boolean {
    return this.paused;
  }

  private ensureVoicesLoaded(): Promise<void> {
    if (!this.synth) return Promise.resolve();
    if (this.voicesReady) return this.voicesReady;

    this.voicesReady = new Promise((resolve) => {
      const existing = this.synth!.getVoices();
      if (existing.length > 0) {
        resolve();
        return;
      }
      const handleVoicesChanged = () => {
        this.synth!.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve();
      };
      this.synth!.addEventListener('voiceschanged', handleVoicesChanged);
      setTimeout(resolve, 1000);
    });

    return this.voicesReady;
  }

  getBestVoice(): SpeechSynthesisVoice | undefined {
    if (!this.synth) return undefined;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return undefined;

    const englishFemale = voices.find(
      (v) => v.lang.startsWith('en') && /female|samantha|victoria|zira|karen|susan/i.test(v.name),
    );
    if (englishFemale) return englishFemale;

    const english = voices.find((v) => v.lang.startsWith('en'));
    if (english) return english;

    return voices[0];
  }

  async speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (!this.synth) return;

    this.stop();
    await this.ensureVoicesLoaded();

    this.lastText = text;
    this.lastOptions = options;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.9;
    utterance.pitch = options.pitch ?? 1.1;
    if (options.volume !== undefined) utterance.volume = options.volume;
    utterance.voice = options.voice ?? this.getBestVoice() ?? null;

    utterance.onstart = () => {
      this.speaking = true;
      this.paused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.speaking = false;
      this.paused = false;
      options.onEnd?.();
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      this.speaking = false;
      this.paused = false;
      const errorCode = event.error;
      if (IGNORED_ERRORS.has(errorCode)) return;
      console.warn('Speech synthesis error:', errorCode);
    };

    this.utterance = utterance;
    this.synth.speak(utterance);
  }

  pause(): void {
    if (this.synth && this.speaking) {
      this.synth.pause();
      this.paused = true;
    }
  }

  resume(): void {
    if (this.synth && this.paused) {
      this.synth.resume();
      this.paused = false;
    }
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this.speaking = false;
    this.paused = false;
  }

  setRate(rate: number): void {
    const wasSpeaking = this.speaking && !this.paused;
    if (wasSpeaking && this.lastText) {
      this.speak(this.lastText, { ...this.lastOptions, rate });
    } else {
      this.lastOptions = { ...this.lastOptions, rate };
    }
  }
}

export const ttsService = new TextToSpeechService();
