import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { questionId, newVersion, prevVersion } = body

    // Find all checklists that use this question
    const checklists = await db.checklists.findMany({
      where: {
        questions: {
          some: {
            questionId: questionId
          }
        }
      },
      include: {
        questions: {
          where: {
            questionId: questionId
          }
        }
      }
    })

    // For each checklist, keep the existing version of the question
    for (const checklist of checklists) {
      const questionInChecklist = checklist.questions[0]
      if (questionInChecklist) {
        // Update the checklist to ensure the question version is preserved
        await db.checklists.update({
          where: { id: checklist.id },
          data: {
            questions: {
              updateMany: {
                where: { questionId: questionId },
                data: { version: questionInChecklist.version }
              }
            }
          }
        })
      }
    }

    revalidatePath('/checklists/lists')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in notify-checklists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
