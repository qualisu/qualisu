import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PlusCircle } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Good morning, Ricky 👋</h1>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="bg-blue-50 text-blue-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Course
        </Button>
        <Button variant="outline" className="bg-orange-50 text-orange-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Page
        </Button>
        <Button variant="outline" className="bg-purple-50 text-purple-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Assignment
        </Button>
        <Button variant="outline" className="bg-teal-50 text-teal-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Quiz
        </Button>
        <Button variant="outline" className="bg-pink-50 text-pink-600">
          <PlusCircle className="w-4 h-4 mr-2" />
          Learning Path
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Most Issued Content */}
        <Card className="col-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Most issued content</h2>
            <span className="text-sm text-gray-500">This week</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">C</span>
                </div>
                <h3 className="text-sm">How to be great UI/UX desig...</h3>
              </div>
              <div className="text-xs text-red-500">↗ +6 since last week</div>
            </div>
            <Button variant="outline" className="w-full text-sm">
              See all issued contents
            </Button>
          </div>
        </Card>

        {/* Assignment Progress */}
        <Card className="col-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Assignment</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>80 submitted</span>
                <span className="text-gray-500">100 remaining</span>
              </div>
              <Progress value={44} className="h-2" />
            </div>
            <Button variant="outline" className="w-full text-sm">
              See all assignment
            </Button>
          </div>
        </Card>

        {/* Learning Content */}
        <Card className="col-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Learning Content</h2>
          </div>
          <div className="relative h-40">
            {/* Add chart component here */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">140</div>
                <div className="text-sm text-gray-500">Contents</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Top Learner */}
        <Card className="col-span-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Top Learner</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                rank: 1,
                name: 'Arif Brata',
                role: 'Jr UI/UX Designer',
                points: 100
              },
              {
                rank: 2,
                name: 'Ardhi Irwandi',
                role: 'Jr UI/UX Designer',
                points: 80
              },
              { rank: 3, name: 'Friza Dipa', role: 'Jr Animation', points: 100 }
            ].map((learner, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm">#{learner.rank}</span>
                  <Avatar className="w-8 h-8" />
                  <div>
                    <div className="text-sm font-medium">{learner.name}</div>
                    <div className="text-xs text-gray-500">{learner.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm">{learner.points}</span>
                  <span className="text-xs text-gray-500">pts</span>
                </div>
              </div>
            ))}
            <Button variant="link" className="w-full text-sm text-blue-600">
              View all ↗
            </Button>
          </div>
        </Card>

        {/* Ungraded Quiz */}
        <Card className="col-span-12 p-6">
          <h2 className="font-semibold mb-4">Ungraded Quiz</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Quiz title</div>
              <div className="col-span-3">Questions</div>
              <div className="col-span-3">Learner</div>
              <div className="col-span-1"></div>
            </div>
            {[
              {
                id: 1,
                title: 'How to be great and good UI/UX designer',
                questions: '4 open ended',
                learner: 'Adit Irwan'
              },
              {
                id: 2,
                title: 'Applications, tools, and plugins to make yo...',
                questions: '10 open ended',
                learner: 'Arif Brata'
              },
              {
                id: 3,
                title: 'Great designer must know the best for cle...',
                questions: '3 open ended',
                learner: 'Ardhi Irwandi'
              }
            ].map((quiz, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 items-center text-sm"
              >
                <div className="col-span-1">{quiz.id}</div>
                <div className="col-span-4">{quiz.title}</div>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                    ?
                  </span>
                  {quiz.questions}
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <Avatar className="w-6 h-6" />
                  {quiz.learner}
                </div>
                <div className="col-span-1">
                  <Button size="sm">Grade Now</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
