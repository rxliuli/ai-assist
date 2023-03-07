export interface ISpeech {
  speechToText(callback: (interimTranscripts: string) => void): Promise<{
    value: () => Promise<string>
    stop: () => void
  }>
  textToSpeech(msg: string): Promise<void>
}
