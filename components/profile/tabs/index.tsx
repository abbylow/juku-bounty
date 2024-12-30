import BountyList from "@/components/bounty/list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileTabs({ relatedProfile }: { relatedProfile: string | undefined }) {
  return (
    <section className="space-y-6 md:px-10 py-10 pb-16">
      <div>
        <Tabs defaultValue="bounty">
          <TabsList>
            <TabsTrigger value="bounty">Involved Bounties</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio (Coming Soon)</TabsTrigger>
          </TabsList>

          <TabsContent value="bounty">
            <BountyList relatedProfile={relatedProfile} />
          </TabsContent>
          <TabsContent value="portfolio">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                {/* <CardDescription>
                  TODO
                </CardDescription> */}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm	">Coming Soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
