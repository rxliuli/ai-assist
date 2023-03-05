import { ISpeech } from './base'
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const azureConfig = {} as { region: string; token: string }

const getRegionAndToken = async () =>
  (await (
    await fetch('/api/get-region-and-token', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json()) as { region: string; token: string }

async function speechToText(callback: (interimTranscripts: string) => void) {
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(azureConfig.token, azureConfig.region)
  speechConfig.speechRecognitionLanguage = 'zh-CN'
  const speechRecognizer = new sdk.SpeechRecognizer(speechConfig, sdk.AudioConfig.fromDefaultMicrophoneInput())

  const p = new Promise<string>((resolve, reject) => {
    let temp = ''
    let result = ''
    speechRecognizer.recognizing = (s, e) => {
      temp = e.result.text
      callback(result + temp)
      console.log(`RECOGNIZING: Text=${e.result.text}`)
    }

    speechRecognizer.recognized = (s, e) => {
      if (e.result.reason == sdk.ResultReason.RecognizedSpeech) {
        console.log(`RECOGNIZED: Text=${e.result.text}`)
        result += e.result.text
        temp = ''
        callback(result + temp)
      } else if (e.result.reason == sdk.ResultReason.NoMatch) {
        console.log('NOMATCH: Speech could not be recognized.')
      }
    }

    speechRecognizer.canceled = (s, e) => {
      console.log(`CANCELED: Reason=${e.reason}`)

      if (e.reason == sdk.CancellationReason.Error) {
        console.log(`"CANCELED: ErrorCode=${e.errorCode}`)
        console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`)
        console.log('CANCELED: Did you set the speech resource key and region values?')
      }

      speechRecognizer.stopContinuousRecognitionAsync()
      reject(e)
    }

    speechRecognizer.sessionStopped = (s, e) => {
      console.log('\n    Session stopped event.')
      speechRecognizer.stopContinuousRecognitionAsync()
      resolve(result)
    }

    console.log('开始识别')
    speechRecognizer.startContinuousRecognitionAsync()
  })
  return {
    value: () => p,
    stop: () => speechRecognizer.stopContinuousRecognitionAsync(),
  }
}

async function textToSpeech(text: string) {
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(azureConfig.token, azureConfig.region)
  speechConfig.speechSynthesisLanguage = 'zh-CN'

  const speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, sdk.AudioConfig.fromDefaultSpeakerOutput())

  await new Promise<void>((resolve, reject) => {
    console.log('开始合成', text)
    speechSynthesizer.speakTextAsync(
      text,
      (result) => {
        resolve()
        console.log('合成结束', result)
        if (result) {
          speechSynthesizer.close()
          return result.audioData
        }
      },
      (error) => {
        reject(error)
        console.log('合成失败')
        console.log(error)
        speechSynthesizer.close()
      },
    )
  })
}

export const azureSpeech: ISpeech & {
  initConfig: () => Promise<void>
} = {
  speechToText,
  textToSpeech,
  initConfig: async () => {
    Object.assign(azureConfig, await getRegionAndToken())
  },
}
