module.exports = {
  onboarding: true,
  hostRules: [
    {
      hostType: "github",
      matchHost: "github.com",
      token: process.env.GITHUB_TOKEN
    }
  ],
  token: process.env.GITHUB_TOKEN,
  onboardingConfig: {
    $schema: "https://docs.renovatebot.com/renovate-schema.json",
    extends: [
      "github>stateshifters/renovate-common"
    ],
    prConcurrentLimit: 1,
    description: "Default Preset for Renovate. Adjust the settings below to configure Renovate for this project.",
    enabled: false,
    enabledManagers: [],
    packageRules: []
  },
  persistRepoData: true,
  platform: 'github',
  autodiscover: true,
  autodiscoverFilter: [
    'meza/*',
    'stateshifters/*'
  ]
}
