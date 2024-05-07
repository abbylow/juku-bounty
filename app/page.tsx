import BountyList from "@/components/bounty/list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <section className="space-y-6 md:px-10 py-10 pb-16">
      <div>
        <Tabs defaultValue="bounty">
          <TabsList>
            <TabsTrigger value="bounty">Knowledge Bounty</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
          </TabsList>

          <TabsContent value="bounty">
            <BountyList />
          </TabsContent>
          <TabsContent value="consultation">
            <Card>
              <CardHeader>
                <CardTitle>Consultation</CardTitle>
                <CardDescription>
                  Private consultation requests to have a chat with subject matter experts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Coming Soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
