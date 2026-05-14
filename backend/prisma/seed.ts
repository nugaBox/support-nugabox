import { PrismaClient, PostCategory, PostStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash('Admin12345!', 10);
  const memberHash = await bcrypt.hash('Member12345!', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password_hash: adminHash,
      name: '관리자',
      role: Role.ADMIN,
      is_active: true,
    },
  });

  const m1 = await prisma.user.upsert({
    where: { username: 'member1' },
    update: {},
    create: {
      username: 'member1',
      password_hash: memberHash,
      name: '테스트회원1',
      role: Role.MEMBER,
      is_active: true,
    },
  });

  const m2 = await prisma.user.upsert({
    where: { username: 'member2' },
    update: {},
    create: {
      username: 'member2',
      password_hash: memberHash,
      name: '테스트회원2',
      role: Role.MEMBER,
      is_active: true,
    },
  });

  const siteA = await prisma.site.upsert({
    where: { code: 'SITE-A' },
    update: {},
    create: {
      name: '데모 사이트 A',
      code: 'SITE-A',
      description: '시드용 데모 사이트',
      is_active: true,
    },
  });

  const siteB = await prisma.site.upsert({
    where: { code: 'SITE-B' },
    update: {},
    create: {
      name: '데모 사이트 B',
      code: 'SITE-B',
      description: '시드용 두 번째 사이트',
      is_active: true,
    },
  });

  await prisma.userSite.deleteMany({});
  await prisma.userSite.createMany({
    data: [
      { user_id: m1.id, site_id: siteA.id },
      { user_id: m1.id, site_id: siteB.id },
      { user_id: m2.id, site_id: siteB.id },
    ],
  });

  await prisma.supportPost.deleteMany({});
  await prisma.statusHistory.deleteMany({});

  const post = await prisma.supportPost.create({
    data: {
      site_id: siteA.id,
      user_id: m1.id,
      title: '[시드] 결제 연동 문의',
      content: '<p>본문 시드 데이터입니다. <strong>굵게</strong></p>',
      category: PostCategory.FEATURE_INQUIRY,
      status: PostStatus.IN_PROGRESS,
      progress_note: '<p>진행내용 샘플입니다.</p>',
      is_private: true,
    },
  });

  await prisma.comment.create({
    data: {
      post_id: post.id,
      user_id: admin.id,
      content: '관리자 댓글 샘플입니다.',
    },
  });

  await prisma.comment.create({
    data: {
      post_id: post.id,
      user_id: m1.id,
      content: '작성자 답글 샘플입니다.',
    },
  });

  await prisma.statusHistory.create({
    data: {
      post_id: post.id,
      before_status: PostStatus.WAITING,
      after_status: PostStatus.IN_PROGRESS,
      changed_by_user_id: admin.id,
    },
  });

  // eslint-disable-next-line no-console
  console.log('시드 완료:', {
    admin: admin.username,
    members: [m1.username, m2.username],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
