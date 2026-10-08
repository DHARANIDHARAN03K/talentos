import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function runSeed() {
  console.log('🌱 Starting TalentOS Seed Data Engine (Prisma)...')

  // 1. Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.requisition.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.profile.deleteMany()

  // 1.5 Create fake profiles (Recruiter, Approver, Auditor)
  const recruiter = await prisma.profile.create({
    data: { id: faker.string.uuid(), role: 'recruiter', name: 'Recruiter Admin' }
  })
  
  // 2. Setup 3 Demo Requisitions
  console.log('📝 Creating 3 initial requisitions...')
  const reqs = await prisma.requisition.createManyAndReturn({
    data: [
      {
        title: 'React Developer',
        location: 'Chennai',
        employment_type: 'contract',
        skills: ['React', 'TypeScript', 'Tailwind', 'Next.js'],
        comp_min: 800000,
        comp_max: 1200000,
        automatable_share: 0.1,
        status: 'open',
        created_by: recruiter.id
      },
      {
        title: 'Data Analyst',
        location: 'Bengaluru',
        employment_type: 'full-time',
        skills: ['SQL', 'Python', 'Tableau', 'Pandas'],
        comp_min: 1200000,
        comp_max: 1800000,
        automatable_share: 0.6,
        status: 'open',
        created_by: recruiter.id
      },
      {
        title: 'QA Lead',
        location: 'Remote',
        employment_type: 'full-time',
        skills: ['Selenium', 'Cypress', 'Playwright', 'CI/CD'],
        comp_min: 1500000,
        comp_max: 2200000,
        automatable_share: 0.3,
        status: 'open',
        created_by: recruiter.id
      }
    ]
  })

  // 3. Generate 140 Normal Candidates
  console.log('👥 Generating normal candidate pool...')
  const normalCandidates = Array.from({ length: 140 }).map((_, i) => ({
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number({ style: 'national' }),
    location: faker.location.city(),
    pool_type: i < 30 ? 'internal' : i < 70 ? 'contractor' : 'external',
    source_channel: faker.helpers.arrayElement(['LinkedIn', 'Referral', 'Career Site', 'Agency']),
    resume_text: `Experienced professional with skills in ${faker.helpers.arrayElements(['React', 'SQL', 'Python', 'Testing', 'Management', 'AWS'], 3).join(', ')}. Solid track record.`,
    expected_comp: faker.number.int({ min: 800000, max: 2500000 }),
    id_doc_hash: faker.string.alphanumeric(32).toUpperCase()
  }))

  await prisma.candidate.createMany({ data: normalCandidates })

  // 4. THE DEMO PAYLOAD: Planted Fraud Cases
  console.log('🚨 Planting specific fraud & trust cases for the demo...')
  const sharedPhone = '+91 98765 43210'
  const sharedIdHash = 'F7A9B3C210D5E4F89A1B2C3D4E5F6A7B'

  const fraudCandidates = await prisma.candidate.createManyAndReturn({
    data: [
      {
        full_name: 'Arjun Mehta',
        email: 'arjun.m@example.com',
        phone: sharedPhone,
        location: 'Chennai',
        pool_type: 'external',
        source_channel: 'LinkedIn',
        resume_text: 'Senior React Developer with 5 years of experience building highly scalable enterprise dashboards using Next.js, Tailwind, and Supabase.',
        id_doc_hash: sharedIdHash
      },
      {
        full_name: 'A. Mehta',
        email: 'amehta.dev@example.com',
        phone: sharedPhone,
        location: 'Chennai',
        pool_type: 'external',
        source_channel: 'Agency',
        resume_text: 'Senior React Dev with 5+ yrs experience building highly scalable enterprise dashboards using NextJS, Tailwind CSS, and Supabase backend.',
        id_doc_hash: sharedIdHash
      },
      {
        full_name: 'Priya Sharma',
        email: 'priya.s@example.com',
        phone: '+91 98765 11111',
        location: 'Bengaluru',
        pool_type: 'external',
        source_channel: 'Career Site',
        resume_text: 'Data Analyst expert in SQL and Python. Built predictive models at TechCorp and simultaneously led data initiatives at DataLogix.'
      },
      {
        full_name: 'Rahul Verma',
        email: 'rahul.ai@example.com',
        phone: '+91 98765 22222',
        location: 'Remote',
        pool_type: 'external',
        source_channel: 'LinkedIn',
        resume_text: 'Expert in React, Angular, Vue, Svelte, Next.js, Nuxt, Node.js, Python, Java, C++, Rust, Go, Kubernetes, Docker, AWS, GCP, Azure, AI, Machine Learning, Blockchain, Web3. Very passionate developer.'
      },
      {
        full_name: 'Sarah Chen',
        email: 'sarah.c@contractor.com',
        phone: '+91 98765 33333',
        location: 'Chennai',
        pool_type: 'contractor',
        source_channel: 'Internal DB',
        resume_text: 'React Developer wrapping up a 6-month contract internally. Ready for next project. Expert in Next.js and Tailwind.'
      }
    ]
  })

  const [arjun1, arjun2, priya, rahul, sarah] = fraudCandidates

  await prisma.employmentHistory.createMany({
    data: [
      { candidate_id: priya.id, employer: 'TechCorp', title: 'Data Analyst', start_date: new Date('2022-01-01'), end_date: new Date('2024-01-01'), full_time: true },
      { candidate_id: priya.id, employer: 'DataLogix', title: 'Senior Analyst', start_date: new Date('2023-01-01'), end_date: new Date('2025-01-01'), full_time: true }
    ]
  })

  console.log('🧮 Calculating Match Scores (M6)...')
  const reactReq = reqs[0]
  await prisma.matchScore.createMany({
    data: [
      {
        requisition_id: reactReq.id,
        candidate_id: sarah.id,
        skill_match: 0.95, trust_score: 98, comp_fit: 0.9, location_fit: 1.0, availability: 1.0, channel_conversion: 0.85, probability: 0.92,
        signals: { skill_match: 0.95, trust_score: 98, comp_fit: 0.9, location_fit: 1.0, availability: 1.0, channel_conversion: 0.85 }
      },
      {
        requisition_id: reactReq.id,
        candidate_id: arjun2.id,
        skill_match: 0.9, trust_score: 35, comp_fit: 0.8, location_fit: 1.0, availability: 0.8, channel_conversion: 0.6, probability: 0.45,
        signals: { skill_match: 0.9, trust_score: 35, comp_fit: 0.8, location_fit: 1.0, availability: 0.8, channel_conversion: 0.6 }
      }
    ]
  })

  await prisma.fraudSignal.createMany({
    data: [
      { candidate_id: arjun2.id, type: 'duplicate', severity: 'high', evidence: { reason: 'Matches phone and ID hash with Arjun Mehta. Resume text similarity: 91%' } },
      { candidate_id: priya.id, type: 'overlap', severity: 'high', evidence: { reason: 'Full-time employment overlaps between TechCorp and DataLogix (Jan 2023 - Jan 2024)' } },
      { candidate_id: rahul.id, type: 'keyword_stuffing', severity: 'medium', evidence: { reason: '22 distinct unrelated technical skills listed with no supporting employment history' } }
    ]
  })

  console.log('✅ Seed Data Generation Complete! DB is locked and loaded for demo.')
}

runSeed().catch(console.error).finally(() => prisma.$disconnect())
