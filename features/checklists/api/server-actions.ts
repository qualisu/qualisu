'use server'

import { db } from '@/lib/db'

interface ChecklistInput {
  name: string
  desc?: string
  userId: string
  pointIds: string[]
  itemNo: string[]
  groupIds: string[]
  modelIds: string[]
  vehicleIds: { saseNo: string }[]
  questionIds: { id: string; version: number }[]
  dealerIds: string[]
  images: string[]
  docs: string[]
}

export const getChecklists = async () => {
  const checklists = await db.checklists.findMany({
    include: {
      points: true,
      groups: true,
      models: true,
      questions: true,
      dealers: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return checklists
}

export const getChecklistById = async (id: string) => {
  const checklist = await db.checklists.findUnique({
    where: { id },
    include: {
      points: true,
      groups: true,
      models: true,
      questions: {
        include: {
          question: {
            include: {
              subCategory: {
                include: {
                  mainCategory: true
                }
              }
            }
          }
        }
      },
      dealers: true
    }
  })
  return checklist
}

export const createChecklist = async (data: ChecklistInput) => {
  try {
    const checklist = await db.checklists.create({
      data: {
        name: data.name,
        desc: data.desc,
        userId: data.userId,
        itemNo: data.itemNo || [],
        images: data.images || [],
        docs: data.docs || [],
        points: {
          connect: (data.pointIds || []).map((point) => ({ id: point }))
        },
        groups: {
          connect: (data.groupIds || []).map((group) => ({ id: group }))
        },
        models: {
          connect: (data.modelIds || []).map((model) => ({ id: model }))
        },
        dealers: {
          connect: (data.dealerIds || []).map((dealer) => ({ id: dealer }))
        }
      },
      include: {
        points: true,
        groups: true,
        models: true,
        questions: true,
        dealers: true
      }
    })

    // Then create ChecklistQuestions for each question
    if (data.questionIds?.length) {
      const validQuestions = data.questionIds.filter((q) => q.id && q.version)
      if (validQuestions.length > 0) {
        await db.checklistQuestions.createMany({
          data: validQuestions.map((question) => ({
            questionId: question.id,
            checklistId: checklist.id,
            version: question.version
          }))
        })
      }
    }

    const finalChecklist = await db.checklists.findUnique({
      where: { id: checklist.id },
      include: {
        points: true,
        groups: true,
        models: true,
        questions: {
          include: {
            question: true
          }
        },
        dealers: true
      }
    })

    return { success: true, checklist: finalChecklist }
  } catch (error) {
    console.error('Error creating checklist:', error)
    return { error: 'Failed to create checklist' }
  }
}

export const updateChecklist = async (
  data: ChecklistInput & { id: string }
) => {
  try {
    if (!data.id) {
      return { error: 'Checklist ID is required for update' }
    }

    const currentChecklist = await db.checklists.findUnique({
      where: { id: data.id },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    })

    if (!currentChecklist) {
      return { error: 'Checklist not found' }
    }

    // Update the checklist
    const updatedChecklist = await db.checklists.update({
      where: { id: data.id },
      data: {
        name: data.name,
        desc: data.desc,
        userId: data.userId,
        itemNo: data.itemNo || [],
        images: data.images || [],
        docs: data.docs || [],
        points: {
          set: [], // First disconnect all existing connections
          connect: (data.pointIds || []).map((point) => ({ id: point }))
        },
        groups: {
          set: [], // First disconnect all existing connections
          connect: (data.groupIds || []).map((group) => ({ id: group }))
        },
        models: {
          set: [], // First disconnect all existing connections
          connect: (data.modelIds || []).map((model) => ({ id: model }))
        },
        dealers: {
          set: [], // First disconnect all existing connections
          connect: (data.dealerIds || []).map((dealer) => ({ id: dealer }))
        }
      }
    })

    // Update checklist questions while preserving versions
    if (data.questionIds?.length) {
      // Get current versions of all questions
      const currentQuestions = await db.questionCatalog.findMany({
        where: {
          id: {
            in: data.questionIds.map((q) => q.id)
          }
        },
        select: {
          id: true,
          version: true
        }
      })

      // Get existing checklist questions
      const existingQuestions = await db.checklistQuestions.findMany({
        where: { checklistId: data.id }
      })

      // Create a map of current versions
      const currentVersionMap = new Map(
        currentQuestions.map((q) => [q.id, q.version])
      )

      // Create a set of questions to keep (those that exist in both old and new lists)
      const questionsToKeep = new Set(
        existingQuestions
          .filter((eq) => data.questionIds.some((q) => q.id === eq.questionId))
          .map((q) => q.questionId)
      )

      // Remove only questions that are not in the new list
      await db.checklistQuestions.deleteMany({
        where: {
          checklistId: data.id,
          questionId: {
            notIn: data.questionIds.map((q) => q.id)
          }
        }
      })

      // Create new questions (only for those that don't exist)
      const questionsToCreate = data.questionIds
        .filter((q) => !questionsToKeep.has(q.id))
        .map((question) => ({
          questionId: question.id,
          checklistId: data.id,
          version: currentVersionMap.get(question.id) || question.version
        }))

      if (questionsToCreate.length > 0) {
        await db.checklistQuestions.createMany({
          data: questionsToCreate
        })
      }
    } else {
      // If no questions provided, remove all questions
      await db.checklistQuestions.deleteMany({
        where: { checklistId: data.id }
      })
    }

    const finalChecklist = await db.checklists.findUnique({
      where: { id: data.id },
      include: {
        points: true,
        groups: true,
        models: true,
        questions: {
          include: {
            question: true
          }
        },
        dealers: true
      }
    })

    return { success: true, checklist: finalChecklist }
  } catch (error) {
    console.error('Error updating checklist:', error)
    return { error: 'Failed to update checklist' }
  }
}

export const deleteChecklist = async (id: string) => {
  try {
    await db.checklists.delete({
      where: { id }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting checklist:', error)
    return { error: 'Failed to delete checklist' }
  }
}

export const trackChecklistQuestions = async (checklistId: string) => {
  try {
    // Get the checklist with its questions, points, and models
    const checklist = await db.checklists.findUnique({
      where: { id: checklistId },
      include: {
        questions: {
          include: {
            question: true
          }
        },
        points: true,
        models: true
      }
    })

    if (!checklist) {
      throw new Error('Checklist not found')
    }

    // For each question in the checklist
    for (const checklistQuestion of checklist.questions) {
      const question = checklistQuestion.question

      // For each point and model combination
      for (const point of checklist.points) {
        for (const model of checklist.models) {
          // Track usage for this specific combination
          await db.questionUsageTracker.upsert({
            where: {
              questionId_type_modelId_pointId: {
                questionId: question.id,
                type: checklist.type,
                modelId: model.id,
                pointId: point.id
              }
            },
            update: {
              useCount: {
                increment: 1
              }
            },
            create: {
              questionId: question.id,
              type: checklist.type,
              modelId: model.id,
              pointId: point.id,
              useCount: 1
            }
          })

          // Check if question should be deactivated
          const tracker = await db.questionUsageTracker.findUnique({
            where: {
              questionId_type_modelId_pointId: {
                questionId: question.id,
                type: checklist.type,
                modelId: model.id,
                pointId: point.id
              }
            }
          })

          if (tracker && tracker.useCount >= question.passiveFrequency) {
            await db.questionCatalog.update({
              where: { id: question.id },
              data: { isActive: 'Active' }
            })
          }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error tracking checklist questions:', error)
    return { error: 'Failed to track checklist questions' }
  }
}

export async function getQuestionsByChecklistId(checklistId: string) {
  try {
    const questions = await db.checklistQuestions.findMany({
      where: {
        checklistId,
        question: {
          isActive: 'Active' // Only get active questions
        }
      },
      include: {
        question: {
          include: {
            subCategory: {
              include: {
                mainCategory: true
              }
            }
          }
        }
      }
    })

    // Filter out questions where the version in checklist doesn't match current version
    const validQuestions = questions.filter(
      (q) => q.version === q.question.version
    )

    return validQuestions
  } catch (error) {
    console.error('Error fetching checklist questions:', error)
    throw new Error('Failed to fetch checklist questions')
  }
}
