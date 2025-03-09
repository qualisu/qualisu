/*
  Warnings:

  - You are about to drop the `TraceQuestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChecklistsToVehicles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TagsToTraceQuestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cQuestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChecklistsToVehicles" DROP CONSTRAINT "_ChecklistsToVehicles_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChecklistsToVehicles" DROP CONSTRAINT "_ChecklistsToVehicles_B_fkey";

-- DropForeignKey
ALTER TABLE "_TagsToTraceQuestions" DROP CONSTRAINT "_TagsToTraceQuestions_A_fkey";

-- DropForeignKey
ALTER TABLE "_TagsToTraceQuestions" DROP CONSTRAINT "_TagsToTraceQuestions_B_fkey";

-- DropForeignKey
ALTER TABLE "cQuestions" DROP CONSTRAINT "cQuestions_checklistId_fkey";

-- DropIndex
DROP INDEX "FailureSubCategory_mainCategoryId_idx";

-- DropIndex
DROP INDEX "FailureSubCategory_name_mainCategoryId_key";

-- AlterTable
ALTER TABLE "Checklists" ADD COLUMN     "docs" TEXT[],
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "status" "FormStatus" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "QuestionCatalog" ADD COLUMN     "answerType" "AnswerType",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxValue" INTEGER,
ADD COLUMN     "minValue" INTEGER,
ADD COLUMN     "passiveFrequency" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "valueUnit" TEXT;

-- DropTable
DROP TABLE "TraceQuestions";

-- DropTable
DROP TABLE "_ChecklistsToVehicles";

-- DropTable
DROP TABLE "_TagsToTraceQuestions";

-- DropTable
DROP TABLE "cQuestions";

-- CreateTable
CREATE TABLE "ChecklistQuestions" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionUsageTracker" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "ChecklistTypes" NOT NULL,
    "modelId" TEXT NOT NULL,
    "pointId" TEXT NOT NULL,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionUsageTracker_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistQuestions_checklistId_idx" ON "ChecklistQuestions"("checklistId");

-- CreateIndex
CREATE INDEX "ChecklistQuestions_questionId_idx" ON "ChecklistQuestions"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChecklistQuestions_checklistId_questionId_key" ON "ChecklistQuestions"("checklistId", "questionId");

-- CreateIndex
CREATE INDEX "QuestionUsageTracker_questionId_idx" ON "QuestionUsageTracker"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionUsageTracker_questionId_type_modelId_pointId_key" ON "QuestionUsageTracker"("questionId", "type", "modelId", "pointId");

-- AddForeignKey
ALTER TABLE "ChecklistQuestions" ADD CONSTRAINT "ChecklistQuestions_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistQuestions" ADD CONSTRAINT "ChecklistQuestions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionUsageTracker" ADD CONSTRAINT "QuestionUsageTracker_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
