'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import {
  AnswerType,
  ChecklistTypes,
  FormStatus,
  QuestionGrade,
  Tags
} from '@prisma/client'

interface QuestionInput {
  id: string
  name: string
  desc?: string
  type: ChecklistTypes
  grade: QuestionGrade
  answerType: AnswerType
  minValue?: number
  maxValue?: number
  valueUnit?: string
  subCategoryId: string
  tags: Tags[]
  images: string[]
  docs: string[]
}

const PASSIVE_FREQUENCY_BY_GRADE = {
  S: 20,
  A: 10,
  B: 5,
  C: 3
}

export const getTags = async () => {
  try {
    const tags = await db.tags.findMany({
      orderBy: { name: 'asc' },
      include: { category: true }
    })
    return tags
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}

export const getTagById = async (id: string) => {
  try {
    const tag = await db.tags.findUnique({
      where: { id },
      include: { category: true }
    })
    return tag
  } catch (error) {
    console.error('Error fetching tag by ID:', error)
    throw error
  }
}

export const createTag = async (data: {
  name: string
  failureSubCategoryIds?: string[]
}) => {
  try {
    // Check if tag already exists
    const existingTag = await db.tags.findUnique({
      where: { name: data.name }
    })

    if (existingTag) {
      // If tag exists but we need to connect new categories
      if (data.failureSubCategoryIds && data.failureSubCategoryIds.length > 0) {
        // Update tag with new categories
        const updatedTag = await db.tags.update({
          where: { id: existingTag.id },
          data: {
            category: {
              connect: data.failureSubCategoryIds.map((id) => ({ id }))
            }
          }
        })

        return updatedTag
      }

      return existingTag
    }

    // Create new tag
    const tag = await db.tags.create({
      data: {
        name: data.name,
        ...(data.failureSubCategoryIds && data.failureSubCategoryIds.length > 0
          ? {
              category: {
                connect: data.failureSubCategoryIds.map((id) => ({ id }))
              }
            }
          : {})
      }
    })

    revalidatePath('/questions')
    return tag
  } catch (error) {
    console.error('Error creating tag:', error)
    throw error
  }
}

export const getQuestionByName = async (name: string) => {
  const question = await db.questionCatalog.findFirst({
    where: { name }
  })
  return question
}

export const getQuestionCatalog = async () => {
  const questions = await db.questionCatalog.findMany({
    where: {
      isLatest: true
    },
    include: {
      tags: true,
      subCategory: { include: { mainCategory: true } }
    }
  })
  return questions
}

export const getQuestionCatalogById = async (id: string) => {
  const question = await db.questionCatalog.findUnique({
    where: { id },
    include: {
      tags: true,
      subCategory: { include: { mainCategory: true } }
    }
  })
  return question
}

export const createQuestion = async (data: QuestionInput) => {
  try {
    const existingQuestion = await getQuestionByName(data.name)

    if (existingQuestion) {
      return { error: 'Question already exists' }
    }

    const question = await db.questionCatalog.create({
      data: {
        ...data,
        tags: { connect: data.tags.map((tag) => ({ id: tag.id })) }
      }
    })

    return { success: true, question }
  } catch (error) {
    console.error('Error creating question:', error)
    return { error: 'Failed to create question' }
  }
}

export const updateQuestion = async (data: QuestionInput) => {
  try {
    if (!data.id) {
      return { error: 'Question ID is required for update' }
    }

    const currentQuestion = await db.questionCatalog.findUnique({
      where: { id: data.id }
    })

    if (!currentQuestion) {
      return { error: 'Question not found' }
    }

    // Set current version as not latest
    await db.questionCatalog.update({
      where: { id: currentQuestion.id },
      data: { isLatest: false }
    })

    // Create new version with incremented version number
    const newQuestion = await db.questionCatalog.create({
      data: {
        ...data,
        id: undefined, // Remove the ID to let Prisma generate a new one
        prevId: currentQuestion.id,
        version: currentQuestion.version + 1,
        isLatest: true,
        tags: { connect: data.tags.map((tag) => ({ id: tag.id })) }
      }
    })

    return { success: true, question: newQuestion }
  } catch (error) {
    console.error('Error updating question:', error)
    return { error: 'Failed to update question' }
  }
}

export const deleteQuestion = async (id: string) => {
  try {
    await db.questionCatalog.delete({ where: { id } })
    revalidatePath('/questions')
  } catch (error) {
    console.error('Error deleting question:', error)
    throw error
  }
}

export async function searchSimilarQuestions(query: string) {
  try {
    const response = await db.questionCatalog.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { desc: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        name: true,
        desc: true,
        subCategoryId: true,
        grade: true,
        tags: { select: { id: true, name: true } }
      },
      take: 5
    })

    return response
  } catch (error) {
    console.error('Error searching questions:', error)
    return []
  }
}

export async function trackQuestionUsage(
  questionId: string,
  type: ChecklistTypes,
  modelId: string,
  pointId: string
) {
  try {
    // Get the question to check its grade and passive frequency
    const question = await db.questionCatalog.findUnique({
      where: { id: questionId },
      select: {
        grade: true,
        passiveFrequency: true,
        isActive: true
      }
    })

    if (!question || !question.isActive) return

    // Update or create usage tracker
    const tracker = await db.questionUsageTracker.upsert({
      where: {
        questionId_type_modelId_pointId: {
          questionId,
          type,
          modelId,
          pointId
        }
      },
      update: {
        useCount: { increment: 1 }
      },
      create: {
        questionId,
        type,
        modelId,
        pointId,
        useCount: 1
      }
    })

    // Check if question should be deactivated
    if (tracker.useCount >= question.passiveFrequency) {
      await db.questionCatalog.update({
        where: { id: questionId },
        data: { isActive: FormStatus.Passive }
      })
    }

    return tracker
  } catch (error) {
    console.error('Error tracking question usage:', error)
    throw error
  }
}

export async function setInitialPassiveFrequency(
  questionId: string,
  grade: QuestionGrade
) {
  try {
    await db.questionCatalog.update({
      where: { id: questionId },
      data: {
        passiveFrequency: PASSIVE_FREQUENCY_BY_GRADE[grade]
      }
    })
  } catch (error) {
    console.error('Error setting passive frequency:', error)
    throw error
  }
}

export async function getQuestionHistory(questionId: string) {
  try {
    // First get the latest version of the question
    const latestQuestion = await db.questionCatalog.findFirst({
      where: {
        OR: [{ id: questionId }, { next: { id: questionId } }],
        isLatest: true
      },
      include: {
        tags: true,
        subCategory: { include: { mainCategory: true } }
      }
    })

    if (!latestQuestion) {
      return { error: 'Question not found' }
    }

    // Then get all versions by traversing prev relations
    const history = [latestQuestion]
    let currentVersion = latestQuestion

    while (currentVersion?.prevId) {
      const prevVersion = await db.questionCatalog.findUnique({
        where: { id: currentVersion.prevId },
        include: {
          tags: true,
          subCategory: { include: { mainCategory: true } }
        }
      })

      if (prevVersion) {
        history.push(prevVersion)
        currentVersion = prevVersion
      } else {
        break
      }
    }

    return { success: true, history }
  } catch (error) {
    console.error('Error fetching question history:', error)
    return { error: 'Failed to fetch question history' }
  }
}

export async function revertToVersion(questionId: string) {
  try {
    // Get the version to revert to
    const targetVersion = await db.questionCatalog.findUnique({
      where: { id: questionId },
      include: {
        tags: true,
        subCategory: { include: { mainCategory: true } }
      }
    })

    if (!targetVersion) {
      return { error: 'Version not found' }
    }

    // Get the latest version
    const latestVersion = await db.questionCatalog.findFirst({
      where: {
        OR: [{ id: targetVersion.id }, { prevId: targetVersion.id }],
        isLatest: true
      }
    })

    if (!latestVersion) {
      return { error: 'Latest version not found' }
    }

    // Set previous latest version as not latest
    await db.questionCatalog.update({
      where: { id: latestVersion.id },
      data: { isLatest: false }
    })

    // Create new version based on the target version
    const newVersion = await db.questionCatalog.create({
      data: {
        name: targetVersion.name,
        desc: targetVersion.desc,
        type: targetVersion.type,
        grade: targetVersion.grade,
        answerType: targetVersion.answerType,
        minValue: targetVersion.minValue,
        maxValue: targetVersion.maxValue,
        valueUnit: targetVersion.valueUnit,
        subCategoryId: targetVersion.subCategoryId,
        images: targetVersion.images,
        docs: targetVersion.docs,
        version: latestVersion.version + 1,
        prevId: latestVersion.id,
        isLatest: true,
        isActive: targetVersion.isActive,
        passiveFrequency: targetVersion.passiveFrequency,
        tags: {
          connect: targetVersion.tags.map((tag) => ({ id: tag.id }))
        }
      }
    })

    revalidatePath('/questions/lists')
    return { success: true, question: newVersion }
  } catch (error) {
    console.error('Error reverting question version:', error)
    return { error: 'Failed to revert question version' }
  }
}
