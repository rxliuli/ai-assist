import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

export const ga = Analytics({
  app: 'chat',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-EX595XB1R6'],
      debug: true,
    }),
  ],
})
