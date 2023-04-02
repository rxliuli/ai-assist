import { EmailClient } from '@azure/communication-email'
import { logger } from '../constants/logger'
import { ServerError } from './ServerError'

export async function sendEmail(options: { to: string; subject: string; html: string }) {
  const emailClient = new EmailClient(process.env.COMMUNICATION_SERVICES_CONNECTION_STRING!)

  const poller = await emailClient.beginSend({
    senderAddress: process.env.SENDER_ADDRESS!,
    content: {
      subject: options.subject,
      html: options.html,
    },
    recipients: {
      to: [
        {
          address: options.to,
        },
      ],
    },
  })
  const response = await poller.pollUntilDone()
  if (response.error) {
    logger.error({
      type: 'sendEmailError',
      message: response.error.message,
      code: response.error.code,
      to: options.to,
    })
    throw new ServerError(response.error.message!, 'SEND_EMAIL_FAILED')
  }
}
