import { last } from 'lodash-es'
import { ISpeech } from './base'

async function speechToText(callback: (interimTranscripts: string) => void) {
  globalThis.SpeechRecognition = globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition

  const recognition = new window.SpeechRecognition()
  const p = new Promise<string>((resolve, reject) => {
    recognition.continuous = true
    recognition.interimResults = true

    const interimTranscripts: string[] = []
    const finalTranscripts: string[] = []
    recognition.onresult = function (event) {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscripts.push(transcript)
          resolve(finalTranscripts.join(', '))
        } else {
          interimTranscripts.push(transcript)
        }
      }

      callback(last(interimTranscripts)!)
      // console.log('Interim transcripts:', interimTranscripts.join(', '))
      // console.log('Final transcripts:', finalTranscripts.join(', '))
    }

    recognition.onerror = function (event) {
      reject(event.error)
    }

    recognition.onend = function () {
      resolve(finalTranscripts.join(', '))
    }

    recognition.start()
  })

  return {
    value: () => p,
    stop: () => recognition.stop(),
  }
}

function textToSpeech(msg: string) {
  let u = new SpeechSynthesisUtterance()
  u.lang = 'zh-CN'
  u.text = msg
  const voices = speechSynthesis.getVoices().filter((it) => it.lang === 'zh-CN')
  u.voice = voices[1]
  speechSynthesis.speak(u)
  return new Promise<void>((resolve, reject) => {
    u.addEventListener('end', () => resolve())
    u.addEventListener('error', reject)
  })
}

export const chromeSpeech: ISpeech = {
  speechToText,
  textToSpeech,
}
