import { PrismaClient, cTypes, QuestionGrade, FormStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Groups
  const group1 = await prisma.groups.create({
    data: {
      name: 'Otobüs',
      status: FormStatus.Active
    }
  })

  const group2 = await prisma.groups.create({
    data: {
      name: 'Kamyon',
      status: FormStatus.Active
    }
  })

  // Create Models
  const model1 = await prisma.models.create({
    data: {
      name: 'Conecto',
      groupsId: group1.id,
      status: FormStatus.Active
    }
  })

  const model2 = await prisma.models.create({
    data: {
      name: 'Actros',
      groupsId: group2.id,
      status: FormStatus.Active
    }
  })

  // Create Vehicles
  const vehicle1 = await prisma.vehicles.create({
    data: {
      name: 'Conecto 12m',
      modelsId: model1.id,
      shortCode: 'CON12',
      vinCode: 'WEB6280032PV123456',
      status: FormStatus.Active
    }
  })

  const vehicle2 = await prisma.vehicles.create({
    data: {
      name: 'Actros L',
      modelsId: model2.id,
      shortCode: 'ACTL',
      vinCode: 'WEB6280032PT123456',
      status: FormStatus.Active
    }
  })

  // Create Points
  const point1 = await prisma.points.create({
    data: {
      name: 'Montaj 1',
      status: FormStatus.Active,
      groups: {
        connect: [{ id: group1.id }]
      }
    }
  })

  const point2 = await prisma.points.create({
    data: {
      name: 'Final 1',
      status: FormStatus.Active,
      groups: {
        connect: [{ id: group1.id }, { id: group2.id }]
      }
    }
  })

  // Create Categories
  const category1 = await prisma.categories.create({
    data: {
      name: 'Elektrik',
      status: FormStatus.Active
    }
  })

  const category2 = await prisma.categories.create({
    data: {
      name: 'Mekanik',
      status: FormStatus.Active
    }
  })

  // Create SubCategories
  const subCategory1 = await prisma.subCategories.create({
    data: {
      name: 'Aydınlatma',
      categoriesId: category1.id,
      status: FormStatus.Active
    }
  })

  const subCategory2 = await prisma.subCategories.create({
    data: {
      name: 'Fren Sistemi',
      categoriesId: category2.id,
      status: FormStatus.Active
    }
  })

  // Create Failures
  const failure1 = await prisma.failures.create({
    data: {
      code: 'E001',
      name: 'Far Arızası',
      status: FormStatus.Active,
      subCategories: {
        connect: [{ id: subCategory1.id }]
      }
    }
  })

  const failure2 = await prisma.failures.create({
    data: {
      code: 'M001',
      name: 'Fren Balata Aşınması',
      status: FormStatus.Active,
      subCategories: {
        connect: [{ id: subCategory2.id }]
      }
    }
  })

  // Create Tags
  const tag1 = await prisma.tags.create({
    data: {
      name: 'Kritik'
    }
  })

  const tag2 = await prisma.tags.create({
    data: {
      name: 'Güvenlik'
    }
  })

  // Create qCatalog items
  const qCatalog1 = await prisma.qCatalog.create({
    data: {
      name: 'Far Kontrol',
      desc: 'Farların çalışma kontrolü',
      type: cTypes.STANDART,
      grade: QuestionGrade.A,
      subCat: {
        connect: [{ id: subCategory1.id }]
      },
      tag: {
        connect: [{ id: tag1.id }]
      },
      images: [],
      docs: [],
      version: 1,
      isLatest: false
    }
  })

  const qCatalog1_v2 = await prisma.qCatalog.create({
    data: {
      name: 'Far Kontrol',
      desc: 'Farların çalışma kontrolü ve ışık şiddeti ölçümü',
      type: cTypes.STANDART,
      grade: QuestionGrade.S,
      subCat: {
        connect: [{ id: subCategory1.id }]
      },
      tag: {
        connect: [{ id: tag1.id }, { id: tag2.id }]
      },
      images: [],
      docs: [],
      version: 2,
      isLatest: true,
      prev: { connect: { id: qCatalog1.id } }
    }
  })

  const qCatalog2 = await prisma.qCatalog.create({
    data: {
      name: 'Fren Balata Kontrolü',
      desc: 'Fren balatalarının kalınlık kontrolü',
      type: cTypes.STANDART,
      grade: QuestionGrade.S,
      subCat: {
        connect: [{ id: subCategory2.id }]
      },
      tag: {
        connect: [{ id: tag1.id }, { id: tag2.id }]
      },
      images: [],
      docs: [],
      version: 1,
      isLatest: true
    }
  })

  // Create a Checklist with Questions
  const checklist1 = await prisma.checklists.create({
    data: {
      name: 'Final Kontrol Listesi',
      desc: 'Araç final kontrol listesi',
      type: cTypes.STANDART,
      points: {
        connect: [{ id: point2.id }]
      },
      groups: {
        connect: [{ id: group1.id }]
      },
      models: {
        connect: [{ id: model1.id }]
      },
      vehicles: {
        connect: [{ id: vehicle1.id }]
      },
      questions: {
        create: [
          {
            name: qCatalog1.name,
            desc: qCatalog1.desc,
            type: qCatalog1.type,
            grade: qCatalog1.grade,
            images: qCatalog1.images,
            docs: qCatalog1.docs,
            qCatalogId: qCatalog1.id,
            qCatalogVer: 1
          },
          {
            name: qCatalog2.name,
            desc: qCatalog2.desc,
            type: qCatalog2.type,
            grade: qCatalog2.grade,
            images: qCatalog2.images,
            docs: qCatalog2.docs,
            qCatalogId: qCatalog2.id,
            qCatalogVer: 1
          }
        ]
      }
    }
  })

  const checklist2 = await prisma.checklists.create({
    data: {
      name: 'Yeni Final Kontrol Listesi',
      desc: 'Güncellenmiş araç final kontrol listesi',
      type: cTypes.STANDART,
      points: {
        connect: [{ id: point2.id }]
      },
      groups: {
        connect: [{ id: group1.id }]
      },
      models: {
        connect: [{ id: model1.id }]
      },
      vehicles: {
        connect: [{ id: vehicle1.id }]
      },
      questions: {
        create: [
          {
            name: qCatalog1_v2.name,
            desc: qCatalog1_v2.desc,
            type: qCatalog1_v2.type,
            grade: qCatalog1_v2.grade,
            images: qCatalog1_v2.images,
            docs: qCatalog1_v2.docs,
            qCatalogId: qCatalog1_v2.id,
            qCatalogVer: 2
          },
          {
            name: qCatalog2.name,
            desc: qCatalog2.desc,
            type: qCatalog2.type,
            grade: qCatalog2.grade,
            images: qCatalog2.images,
            docs: qCatalog2.docs,
            qCatalogId: qCatalog2.id,
            qCatalogVer: 1
          }
        ]
      }
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
