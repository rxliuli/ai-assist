import { it } from 'vitest'
import { EmailClient } from '@azure/communication-email'

it.skip('send', async () => {
  const emailClient = new EmailClient(process.env.COMMUNICATION_SERVICES_CONNECTION_STRING!)

  const poller = await emailClient.beginSend({
    senderAddress: process.env.SENDER_ADDRESS!,
    content: {
      subject: 'Welcome to Azure Communication Services Email',
      plainText: 'This email message is sent from Azure Communication Services Email using the JavaScript SDK.',
    },
    recipients: {
      to: [
        {
          address: 'rxliuli@gmail.com',
          displayName: 'Customer Name',
        },
      ],
    },
  })
  const response = await poller.pollUntilDone()
  console.log(response)
}, 30_000)
