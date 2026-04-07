import { PrismaClient } from '@prisma/client';
import regionsData from './data/regions.json';

const prisma = new PrismaClient();

async function seedRegions() {
  console.log('🌱 지역 데이터 시딩 시작...');

  // createMany로 한 번에 삽입 (skipDuplicates: code가 이미 있으면 건너뜀)
  const result = await prisma.region.createMany({
    data: regionsData.map((r) => ({
      code: r.code,
      name: r.name,
      sigungu: r.sigungu,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ 지역 데이터 ${result.count}건 삽입 완료 (총 ${regionsData.length}건 중)`);
}

async function main() {
  await seedRegions();
}

main()
  .catch((e) => {
    console.error('❌ 시딩 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
