import { createFileRoute } from '@tanstack/react-router'
import { Heading, HeadingGreen, Subheading } from '~/ui/heading'
import { Text } from '~/ui/text'

export const Route = createFileRoute('/_authed/ladders/rules')({
  component: RulesComponent,
})

function RulesComponent() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Heading level={1}>
          Ladder Rules & <HeadingGreen>How Points Work</HeadingGreen>
        </Heading>
      </div>

      <Text className="text-lg mb-8">
        Our ladder is designed to reward playing matches, competing hard, and beating stronger opponents—while preventing "farming" or unfair rankings.
      </Text>

      <Text className="mb-2">
        Here's how it works:
      </Text>

      <div className="space-y-8">
        <section>
          <Subheading level={2} className="mb-2 text-lg!">
            🏆 Match Points
          </Subheading>
          <Text className="mb-4">
            Every match you play earns ladder points:
          </Text>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-base/6 text-black sm:text-sm/6 dark:text-white">
            <li>Win a match: <strong className="font-medium text-zinc-950 dark:text-white">+50 points</strong></li>
            <li>Lose a match: <strong className="font-medium text-zinc-950 dark:text-white">+12 points</strong></li>
          </ul>
          <Text>
            You always earn something for playing. Winning earns much more, but losing still moves you forward—especially if you play someone stronger.
          </Text>
        </section>

        <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

        <section>
          <Subheading level={2} className="mb-2 text-lg!">
            🎁 Bonus Points
          </Subheading>
          <Text className="mb-4">
            You can earn extra points during each match based on performance:
          </Text>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-base/6 text-black sm:text-sm/6 dark:text-white">
            <li>Straight-set win: <strong className="font-medium text-zinc-950 dark:text-white">+5 points</strong></li>
            <li>Bagel set (6–0): <strong className="font-medium text-zinc-950 dark:text-white">+3 points each</strong></li>
            <li>3-match win streak: <strong className="font-medium text-zinc-950 dark:text-white">+3 extra points on the 3rd win</strong></li>
          </ul>
          <Text>
            These bonuses make matches fun and reward strong play.
          </Text>
        </section>

        <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

        <section>
          <Subheading level={2} className="mb-2 text-lg!">
            📈 Strength-Based Bonuses (Elo System)
          </Subheading>
          <Text className="mb-4">
            We use an internal Elo rating to measure player strength.
            You don't need to track it—it updates automatically in the background.
          </Text>
          <Text className="mb-4">
            Elo affects how many ladder points you earn:
          </Text>
          
          <div className="space-y-4 mb-4">
            <div>
              <Text className="font-semibold mb-2">Beat someone higher-rated?</Text>
              <Text>🎉 You get extra points for an upset.</Text>
            </div>
            
            <div>
              <Text className="font-semibold mb-2">Beat someone much lower-rated?</Text>
              <Text>Your win is still worth 50, but you may receive slightly fewer bonus points.</Text>
            </div>
            
            <div>
              <Text className="font-semibold mb-2">Lose to a much stronger player?</Text>
              <Text>You earn a small underdog bonus on top of your 12 points.</Text>
            </div>
          </div>

          <Text>
            This keeps matches fair and prevents players from boosting their score by only playing weaker opponents.
          </Text>
        </section>

        <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

        <section>
          <Subheading level={2} className="mb-2 text-lg!">
            🪜 Ladder Ranking
          </Subheading>
          <Text className="mb-4">
            Your position on the ladder is based on your total ladder points.
            The more you play and the more you win, the higher you climb.
          </Text>
          <ul className="list-disc list-inside space-y-2 mb-4 ml-4 text-base/6 text-black sm:text-sm/6 dark:text-white">
            <li>Active players stay competitive</li>
            <li>Strong players rise quickly</li>
            <li>New players can climb by earning upsets</li>
            <li>Farming weaker opponents doesn't give unfair advantages</li>
          </ul>
        </section>

        <div className="my-8 border-t border-gray-300 dark:border-gray-700"></div>

        <section>
          <Subheading level={2} className="mb-2 text-lg!">
            📊 Summary
          </Subheading>
          <Text className="text-lg font-medium">
            Play often. Compete hard. Beat stronger players.
          </Text>
          <Text className="mt-2">
            Every match counts—and every match helps you climb.
          </Text>
        </section>
      </div>
    </div>
  )
}
