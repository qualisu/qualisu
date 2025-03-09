/*
  Warnings:

  - The `isActive` column on the `QuestionCatalog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionCatalog" DROP COLUMN "isActive",
ADD COLUMN     "isActive" "FormStatus" NOT NULL DEFAULT 'Active';
