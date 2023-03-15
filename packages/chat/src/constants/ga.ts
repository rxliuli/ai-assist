import Analytics from 'analytics'
import googleAnalytics from '@analytics/google-analytics'

export const ga4 = Analytics({
  app: 'chat',
  plugins: [
    googleAnalytics({
      measurementIds: ['G-EX595XB1R6'],
    }),
  ],
})
