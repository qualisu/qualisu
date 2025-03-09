-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('Active', 'Passive');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'VIEWER', 'EDITOR', 'MOBILE');

-- CreateEnum
CREATE TYPE "Departments" AS ENUM ('ARGE', 'URGE', 'GKK', 'PK', 'FQM', 'SSH');

-- CreateEnum
CREATE TYPE "QuestionGrade" AS ENUM ('S', 'A', 'B', 'C');

-- CreateEnum
CREATE TYPE "SimulatorStatus" AS ENUM ('Planned', 'InProgress', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('YesNo', 'MinMax', 'Barcode', 'Brand');

-- CreateEnum
CREATE TYPE "ChecklistTypes" AS ENUM ('STANDART', 'ZOBAS', 'REGULATION', 'COMPLAINT', 'SUPPLIER', 'TRACING', 'GENERIC', 'PERIODIC', 'COP', 'PARTCOP', 'GCA');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "dept" "Departments" NOT NULL DEFAULT 'PK',
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGroups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "types" "ChecklistTypes"[] DEFAULT ARRAY[]::"ChecklistTypes"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwoFactorToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwoFactorConfirmation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwoFactorConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleGroupId" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "saseNo" TEXT NOT NULL,
    "warStart" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "warEnd" TIMESTAMP(3) NOT NULL,
    "vehicleGroupId" TEXT NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "prodDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("saseNo")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailureCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailureCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailureSubCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mainCategoryId" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FailureSubCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailureCodes" (
    "code" TEXT NOT NULL,
    "descEng" TEXT NOT NULL,
    "descTurk" TEXT NOT NULL,
    "status" "FormStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "FailureCodes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Dealers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "checklistsId" TEXT,

    CONSTRAINT "Dealers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "type" "ChecklistTypes" NOT NULL DEFAULT 'STANDART',
    "grade" "QuestionGrade" NOT NULL DEFAULT 'C',
    "subCategoryId" TEXT NOT NULL,
    "images" TEXT[],
    "docs" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "prevId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraceQuestions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "answerType" "AnswerType" NOT NULL DEFAULT 'Barcode',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "prevId" TEXT,
    "images" TEXT[],
    "docs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TraceQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cQuestions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "type" "ChecklistTypes" NOT NULL DEFAULT 'STANDART',
    "grade" "QuestionGrade" NOT NULL DEFAULT 'B',
    "images" TEXT[],
    "docs" TEXT[],
    "checklistId" TEXT NOT NULL,
    "qCatalogId" TEXT,
    "qCatalogVer" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Checklists" (
    "id" TEXT NOT NULL,
    "type" "ChecklistTypes" NOT NULL DEFAULT 'STANDART',
    "name" TEXT NOT NULL,
    "desc" TEXT,
    "userId" TEXT,
    "itemNo" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Checklists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claims" (
    "claimNo" TEXT NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL,
    "failureCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "dealerName" TEXT NOT NULL,
    "vehicleGroupId" TEXT NOT NULL,
    "vehicleModelId" TEXT NOT NULL,
    "saseNo" TEXT NOT NULL,
    "kilometre" DOUBLE PRECISION NOT NULL,
    "budgetNo" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mainCategoryName" TEXT NOT NULL,
    "subCategoryName" TEXT NOT NULL,
    "customMain" TEXT,
    "customSub" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserToUserGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserToUserGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PointsToVehicleGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PointsToVehicleGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PointsToUserGroups" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PointsToUserGroups_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FailureCodesToFailureSubCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FailureCodesToFailureSubCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TagsToTraceQuestions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TagsToTraceQuestions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_QuestionCatalogToTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QuestionCatalogToTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChecklistsToPoints" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChecklistsToPoints_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChecklistsToVehicleGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChecklistsToVehicleGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChecklistsToVehicleModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChecklistsToVehicleModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ChecklistsToVehicles" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChecklistsToVehicles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserGroups_name_key" ON "UserGroups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_email_token_key" ON "VerificationToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorToken_token_key" ON "TwoFactorToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorToken_email_token_key" ON "TwoFactorToken"("email", "token");

-- CreateIndex
CREATE UNIQUE INDEX "TwoFactorConfirmation_userId_key" ON "TwoFactorConfirmation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleGroup_name_key" ON "VehicleGroup"("name");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleModel_name_key" ON "VehicleModel"("name");

-- CreateIndex
CREATE INDEX "VehicleModel_vehicleGroupId_idx" ON "VehicleModel"("vehicleGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicles_saseNo_key" ON "Vehicles"("saseNo");

-- CreateIndex
CREATE INDEX "Vehicles_vehicleGroupId_idx" ON "Vehicles"("vehicleGroupId");

-- CreateIndex
CREATE INDEX "Vehicles_vehicleModelId_idx" ON "Vehicles"("vehicleModelId");

-- CreateIndex
CREATE UNIQUE INDEX "Points_name_key" ON "Points"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FailureCategory_name_key" ON "FailureCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FailureSubCategory_name_key" ON "FailureSubCategory"("name");

-- CreateIndex
CREATE INDEX "FailureSubCategory_mainCategoryId_idx" ON "FailureSubCategory"("mainCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FailureSubCategory_name_mainCategoryId_key" ON "FailureSubCategory"("name", "mainCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FailureCodes_code_key" ON "FailureCodes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Dealers_code_key" ON "Dealers"("code");

-- CreateIndex
CREATE INDEX "Dealers_checklistsId_idx" ON "Dealers"("checklistsId");

-- CreateIndex
CREATE UNIQUE INDEX "Tags_name_key" ON "Tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionCatalog_prevId_key" ON "QuestionCatalog"("prevId");

-- CreateIndex
CREATE INDEX "QuestionCatalog_prevId_idx" ON "QuestionCatalog"("prevId");

-- CreateIndex
CREATE UNIQUE INDEX "TraceQuestions_prevId_key" ON "TraceQuestions"("prevId");

-- CreateIndex
CREATE INDEX "TraceQuestions_prevId_idx" ON "TraceQuestions"("prevId");

-- CreateIndex
CREATE INDEX "cQuestions_checklistId_idx" ON "cQuestions"("checklistId");

-- CreateIndex
CREATE UNIQUE INDEX "Checklists_name_key" ON "Checklists"("name");

-- CreateIndex
CREATE INDEX "Checklists_userId_idx" ON "Checklists"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Claims_claimNo_key" ON "Claims"("claimNo");

-- CreateIndex
CREATE INDEX "Claims_vehicleModelId_idx" ON "Claims"("vehicleModelId");

-- CreateIndex
CREATE INDEX "Claims_vehicleGroupId_idx" ON "Claims"("vehicleGroupId");

-- CreateIndex
CREATE INDEX "Report_mainCategoryName_idx" ON "Report"("mainCategoryName");

-- CreateIndex
CREATE INDEX "Report_subCategoryName_idx" ON "Report"("subCategoryName");

-- CreateIndex
CREATE INDEX "_UserToUserGroups_B_index" ON "_UserToUserGroups"("B");

-- CreateIndex
CREATE INDEX "_PointsToVehicleGroup_B_index" ON "_PointsToVehicleGroup"("B");

-- CreateIndex
CREATE INDEX "_PointsToUserGroups_B_index" ON "_PointsToUserGroups"("B");

-- CreateIndex
CREATE INDEX "_FailureCodesToFailureSubCategory_B_index" ON "_FailureCodesToFailureSubCategory"("B");

-- CreateIndex
CREATE INDEX "_TagsToTraceQuestions_B_index" ON "_TagsToTraceQuestions"("B");

-- CreateIndex
CREATE INDEX "_QuestionCatalogToTags_B_index" ON "_QuestionCatalogToTags"("B");

-- CreateIndex
CREATE INDEX "_ChecklistsToPoints_B_index" ON "_ChecklistsToPoints"("B");

-- CreateIndex
CREATE INDEX "_ChecklistsToVehicleGroup_B_index" ON "_ChecklistsToVehicleGroup"("B");

-- CreateIndex
CREATE INDEX "_ChecklistsToVehicleModel_B_index" ON "_ChecklistsToVehicleModel"("B");

-- CreateIndex
CREATE INDEX "_ChecklistsToVehicles_B_index" ON "_ChecklistsToVehicles"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwoFactorConfirmation" ADD CONSTRAINT "TwoFactorConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleModel" ADD CONSTRAINT "VehicleModel_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailureSubCategory" ADD CONSTRAINT "FailureSubCategory_mainCategoryId_fkey" FOREIGN KEY ("mainCategoryId") REFERENCES "FailureCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dealers" ADD CONSTRAINT "Dealers_checklistsId_fkey" FOREIGN KEY ("checklistsId") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCatalog" ADD CONSTRAINT "QuestionCatalog_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "FailureSubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionCatalog" ADD CONSTRAINT "QuestionCatalog_prevId_fkey" FOREIGN KEY ("prevId") REFERENCES "QuestionCatalog"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "cQuestions" ADD CONSTRAINT "cQuestions_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checklists" ADD CONSTRAINT "Checklists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claims" ADD CONSTRAINT "Claims_vehicleModelId_fkey" FOREIGN KEY ("vehicleModelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claims" ADD CONSTRAINT "Claims_vehicleGroupId_fkey" FOREIGN KEY ("vehicleGroupId") REFERENCES "VehicleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claims" ADD CONSTRAINT "Claims_failureCode_fkey" FOREIGN KEY ("failureCode") REFERENCES "FailureCodes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_mainCategoryName_fkey" FOREIGN KEY ("mainCategoryName") REFERENCES "FailureCategory"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_subCategoryName_fkey" FOREIGN KEY ("subCategoryName") REFERENCES "FailureSubCategory"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroups" ADD CONSTRAINT "_UserToUserGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserToUserGroups" ADD CONSTRAINT "_UserToUserGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsToVehicleGroup" ADD CONSTRAINT "_PointsToVehicleGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsToVehicleGroup" ADD CONSTRAINT "_PointsToVehicleGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsToUserGroups" ADD CONSTRAINT "_PointsToUserGroups_A_fkey" FOREIGN KEY ("A") REFERENCES "Points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PointsToUserGroups" ADD CONSTRAINT "_PointsToUserGroups_B_fkey" FOREIGN KEY ("B") REFERENCES "UserGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FailureCodesToFailureSubCategory" ADD CONSTRAINT "_FailureCodesToFailureSubCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "FailureCodes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FailureCodesToFailureSubCategory" ADD CONSTRAINT "_FailureCodesToFailureSubCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "FailureSubCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagsToTraceQuestions" ADD CONSTRAINT "_TagsToTraceQuestions_A_fkey" FOREIGN KEY ("A") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagsToTraceQuestions" ADD CONSTRAINT "_TagsToTraceQuestions_B_fkey" FOREIGN KEY ("B") REFERENCES "TraceQuestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionCatalogToTags" ADD CONSTRAINT "_QuestionCatalogToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "QuestionCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuestionCatalogToTags" ADD CONSTRAINT "_QuestionCatalogToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToPoints" ADD CONSTRAINT "_ChecklistsToPoints_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToPoints" ADD CONSTRAINT "_ChecklistsToPoints_B_fkey" FOREIGN KEY ("B") REFERENCES "Points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicleGroup" ADD CONSTRAINT "_ChecklistsToVehicleGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicleGroup" ADD CONSTRAINT "_ChecklistsToVehicleGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicleModel" ADD CONSTRAINT "_ChecklistsToVehicleModel_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicleModel" ADD CONSTRAINT "_ChecklistsToVehicleModel_B_fkey" FOREIGN KEY ("B") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicles" ADD CONSTRAINT "_ChecklistsToVehicles_A_fkey" FOREIGN KEY ("A") REFERENCES "Checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChecklistsToVehicles" ADD CONSTRAINT "_ChecklistsToVehicles_B_fkey" FOREIGN KEY ("B") REFERENCES "Vehicles"("saseNo") ON DELETE CASCADE ON UPDATE CASCADE;
