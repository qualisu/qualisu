-- CreateTable
CREATE TABLE "Simulators" (
    "id" TEXT NOT NULL,
    "itemNo" TEXT NOT NULL,
    "status" "SimulatorStatus" NOT NULL DEFAULT 'InProgress',
    "pointsId" TEXT NOT NULL,
    "checklistsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "questionId" TEXT NOT NULL,
    "simulatorsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Simulators_pointsId_idx" ON "Simulators"("pointsId");

-- CreateIndex
CREATE INDEX "Simulators_checklistsId_idx" ON "Simulators"("checklistsId");

-- CreateIndex
CREATE INDEX "Answers_simulatorsId_idx" ON "Answers"("simulatorsId");

-- AddForeignKey
ALTER TABLE "Simulators" ADD CONSTRAINT "Simulators_pointsId_fkey" FOREIGN KEY ("pointsId") REFERENCES "Points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulators" ADD CONSTRAINT "Simulators_checklistsId_fkey" FOREIGN KEY ("checklistsId") REFERENCES "Checklists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_simulatorsId_fkey" FOREIGN KEY ("simulatorsId") REFERENCES "Simulators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
