import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed initial course data for The Brand Coach Network
 * Run: npx ts-node src/common/database/seeds/seed-programs.ts
 */

const PROGRAMS = [
  {
    id: uuidv4(),
    title: 'Brand Mastery Blueprint',
    slug: 'brand-mastery-blueprint',
    description:
      'A comprehensive 8-week program designed to help you discover, build, and launch your personal brand. From defining your brand identity to creating visibility strategies, this course covers everything you need to become a recognized thought leader in your industry.',
    short_description: 'Build your personal brand from scratch in 8 weeks',
    difficulty: 'beginner',
    price: 4999,
    currency: 'KES',
    is_free: false,
    estimated_duration: 960,
    tags: 'branding,personal-brand,visibility,entrepreneurship',
    learning_outcomes: JSON.stringify([
      'Define your unique personal brand identity',
      'Create a compelling brand story and messaging',
      'Build an online presence that attracts opportunities',
      'Develop a content strategy for brand visibility',
      'Launch your personal brand with confidence',
    ]),
    status: 'published',
    published_at: new Date().toISOString(),
    enrollment_count: 0,
  },
  {
    id: uuidv4(),
    title: 'Entrepreneurship Accelerator',
    slug: 'entrepreneurship-accelerator',
    description:
      'Transform your business idea into a thriving venture. This intensive program covers market validation, business model design, financial planning, and growth strategies specifically tailored for African entrepreneurs.',
    short_description: 'From business idea to thriving venture in 12 weeks',
    difficulty: 'intermediate',
    price: 7999,
    currency: 'KES',
    is_free: false,
    estimated_duration: 1440,
    tags: 'entrepreneurship,business,startup,africa',
    learning_outcomes: JSON.stringify([
      'Validate your business idea with real market data',
      'Design a sustainable business model',
      'Create financial projections and secure funding',
      'Build marketing and sales funnels',
      'Scale your business for growth',
    ]),
    status: 'published',
    published_at: new Date().toISOString(),
    enrollment_count: 0,
  },
  {
    id: uuidv4(),
    title: 'Leadership & Executive Presence',
    slug: 'leadership-executive-presence',
    description:
      'Designed for corporate professionals and emerging leaders. Master the art of executive communication, strategic thinking, and leading with influence. Build the executive presence that gets you noticed for C-suite positions.',
    short_description: 'Master executive communication and leadership presence',
    difficulty: 'advanced',
    price: 12999,
    currency: 'KES',
    is_free: false,
    estimated_duration: 1200,
    tags: 'leadership,executive,corporate,communication',
    learning_outcomes: JSON.stringify([
      'Develop a commanding executive presence',
      'Master strategic communication techniques',
      'Build and lead high-performing teams',
      'Navigate organizational politics effectively',
      'Create your leadership brand and legacy',
    ]),
    status: 'published',
    published_at: new Date().toISOString(),
    enrollment_count: 0,
  },
  {
    id: uuidv4(),
    title: 'Introduction to Personal Branding',
    slug: 'introduction-to-personal-branding',
    description:
      'A free introductory course that covers the fundamentals of personal branding. Perfect for anyone new to the concept of building and managing their personal brand in the digital age.',
    short_description: 'Free course: Learn the fundamentals of personal branding',
    difficulty: 'beginner',
    price: 0,
    currency: 'KES',
    is_free: true,
    estimated_duration: 120,
    tags: 'branding,free,introduction,beginner',
    learning_outcomes: JSON.stringify([
      'Understand what a personal brand is and why it matters',
      'Identify your unique value proposition',
      'Create your brand statement',
      'Set up your basic online presence',
    ]),
    status: 'published',
    published_at: new Date().toISOString(),
    enrollment_count: 0,
  },
  {
    id: uuidv4(),
    title: 'Digital Marketing for Coaches',
    slug: 'digital-marketing-for-coaches',
    description:
      'Learn how to market your coaching business online. This program covers social media strategy, content marketing, email funnels, paid advertising, and client acquisition strategies specifically designed for coaches and consultants.',
    short_description: 'Market your coaching business and attract clients online',
    difficulty: 'intermediate',
    price: 5999,
    currency: 'KES',
    is_free: false,
    estimated_duration: 840,
    tags: 'marketing,digital,coaching,social-media',
    learning_outcomes: JSON.stringify([
      'Build a social media strategy that attracts coaching clients',
      'Create content that establishes thought leadership',
      'Design email funnels for client conversion',
      'Run effective paid advertising campaigns',
      'Build a referral system for sustainable growth',
    ]),
    status: 'published',
    published_at: new Date().toISOString(),
    enrollment_count: 0,
  },
  {
    id: uuidv4(),
    title: 'Community Empowerment & Impact',
    slug: 'community-empowerment-impact',
    description:
      'Designed for CEC coordinators and community leaders. Learn to build sustainable empowerment programs, measure social impact, engage stakeholders, and create lasting community transformation aligned with the #ABillionLivesGlobally mission.',
    short_description: 'Build and lead community empowerment initiatives',
    difficulty: 'intermediate',
    price: 3999,
    currency: 'KES',
    is_free: false,
    estimated_duration: 720,
    tags: 'community,impact,empowerment,leadership',
    learning_outcomes: JSON.stringify([
      'Design community empowerment programs',
      'Measure and report social impact effectively',
      'Engage and retain community stakeholders',
      'Secure funding and partnerships for initiatives',
      'Scale community programs sustainably',
    ]),
    status: 'draft',
    published_at: null,
    enrollment_count: 0,
  },
];

function generateModules(programId: string, programSlug: string) {
  const moduleMap: Record<string, Array<{ title: string; lessons: Array<{ title: string; contentType: string; isFree: boolean; estimatedDuration: number; content: string }> }>> = {
    'brand-mastery-blueprint': [
      {
        title: 'Module 1: Brand Discovery',
        lessons: [
          { title: 'What is Personal Branding?', contentType: 'video', isFree: true, estimatedDuration: 15, content: 'Understanding the fundamentals of personal branding and why it matters in today\'s digital world.' },
          { title: 'Discovering Your Unique Value', contentType: 'text', isFree: false, estimatedDuration: 20, content: '# Discovering Your Unique Value\n\nEvery person has a unique combination of skills, experiences, and perspectives...' },
          { title: 'Your Brand Identity Canvas', contentType: 'assignment', isFree: false, estimatedDuration: 30, content: 'Complete the Brand Identity Canvas worksheet to map out your personal brand foundations.' },
        ],
      },
      {
        title: 'Module 2: Brand Messaging',
        lessons: [
          { title: 'Crafting Your Brand Story', contentType: 'video', isFree: false, estimatedDuration: 20, content: 'Learn the storytelling framework for creating a compelling personal brand narrative.' },
          { title: 'Your Elevator Pitch', contentType: 'text', isFree: false, estimatedDuration: 15, content: '# Creating Your Elevator Pitch\n\nAn effective elevator pitch communicates who you are, what you do, and why it matters...' },
          { title: 'Brand Messaging Quiz', contentType: 'quiz', isFree: false, estimatedDuration: 10, content: '' },
        ],
      },
      {
        title: 'Module 3: Online Presence',
        lessons: [
          { title: 'Building Your Digital Footprint', contentType: 'video', isFree: false, estimatedDuration: 25, content: 'Set up and optimize your presence across LinkedIn, Instagram, Twitter, and your website.' },
          { title: 'Content Strategy Framework', contentType: 'text', isFree: false, estimatedDuration: 20, content: '# Content Strategy Framework\n\nConsistent content is the fuel of personal branding...' },
          { title: 'Module 3 Assessment', contentType: 'quiz', isFree: false, estimatedDuration: 15, content: '' },
        ],
      },
    ],
    'introduction-to-personal-branding': [
      {
        title: 'Getting Started',
        lessons: [
          { title: 'Welcome to Personal Branding', contentType: 'video', isFree: true, estimatedDuration: 10, content: 'An introduction to the course and what you will learn.' },
          { title: 'Why Personal Branding Matters', contentType: 'text', isFree: true, estimatedDuration: 15, content: '# Why Personal Branding Matters\n\nIn today\'s connected world, your personal brand is your most valuable asset...' },
          { title: 'Your Brand Statement', contentType: 'text', isFree: true, estimatedDuration: 20, content: '# Creating Your Brand Statement\n\nA brand statement is a clear, concise description of who you are professionally...' },
          { title: 'Quick Quiz', contentType: 'quiz', isFree: true, estimatedDuration: 5, content: '' },
        ],
      },
    ],
  };

  const modules = moduleMap[programSlug] || [
    {
      title: 'Module 1: Foundations',
      lessons: [
        { title: 'Course Introduction', contentType: 'video', isFree: true, estimatedDuration: 10, content: 'Welcome to this course. Here is what you will learn...' },
        { title: 'Core Concepts', contentType: 'text', isFree: false, estimatedDuration: 20, content: '# Core Concepts\n\nIn this lesson, we cover the foundational concepts...' },
        { title: 'Module 1 Quiz', contentType: 'quiz', isFree: false, estimatedDuration: 10, content: '' },
      ],
    },
    {
      title: 'Module 2: Deep Dive',
      lessons: [
        { title: 'Advanced Techniques', contentType: 'video', isFree: false, estimatedDuration: 25, content: 'Building on the foundations, we explore advanced techniques...' },
        { title: 'Practical Application', contentType: 'assignment', isFree: false, estimatedDuration: 30, content: 'Apply what you\'ve learned in this hands-on exercise.' },
      ],
    },
  ];

  return modules.map((mod, mIdx) => ({
    id: uuidv4(),
    program_id: programId,
    title: mod.title,
    description: `Learn the key concepts covered in ${mod.title}`,
    sort_order: mIdx,
    estimated_duration: mod.lessons.reduce((sum, l) => sum + l.estimatedDuration, 0),
    lessons: mod.lessons.map((lesson, lIdx) => ({
      id: uuidv4(),
      title: lesson.title,
      content_type: lesson.contentType,
      is_free: lesson.isFree,
      estimated_duration: lesson.estimatedDuration,
      content: lesson.content,
      sort_order: lIdx,
    })),
  }));
}

export async function seedPrograms(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log('🌱 Seeding programs...');

    for (const program of PROGRAMS) {
      // Insert program
      await queryRunner.query(
        `INSERT INTO programs (id, title, slug, description, short_description, difficulty, price, currency, is_free, estimated_duration, tags, learning_outcomes, status, published_at, enrollment_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [
          program.id, program.title, program.slug, program.description,
          program.short_description, program.difficulty, program.price,
          program.currency, program.is_free, program.estimated_duration,
          program.tags, program.learning_outcomes, program.status,
          program.published_at, program.enrollment_count,
        ],
      );

      // Insert modules and lessons
      const modules = generateModules(program.id, program.slug);
      for (const mod of modules) {
        await queryRunner.query(
          `INSERT INTO program_modules (id, program_id, title, description, sort_order, estimated_duration, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
           ON CONFLICT DO NOTHING`,
          [mod.id, mod.program_id, mod.title, mod.description, mod.sort_order, mod.estimated_duration],
        );

        for (const lesson of mod.lessons) {
          await queryRunner.query(
            `INSERT INTO lessons (id, module_id, title, content_type, is_free, estimated_duration, content, sort_order, resource_urls, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, '[]', NOW(), NOW())
             ON CONFLICT DO NOTHING`,
            [lesson.id, mod.id, lesson.title, lesson.content_type, lesson.is_free, lesson.estimated_duration, lesson.content, lesson.sort_order],
          );
        }
      }

      console.log(`  ✅ ${program.title} (${modules.length} modules)`);
    }

    await queryRunner.commitTransaction();
    console.log('🎉 Programs seeded successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding programs:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

// Standalone execution
if (require.main === module) {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'brandcoach',
  });

  AppDataSource.initialize()
    .then((ds) => seedPrograms(ds))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
