import type { Database } from '../lib/sql'
import { profile, projects, skills } from './content'

/** Skills I use at ANO Software, according to my CV. */
const AT_WORK = new Set([
  'Java',
  'Python',
  'TypeScript',
  'SQL',
  'Spring Boot',
  'React',
  'Vite',
  'PostgreSQL',
  'Docker',
  'Liquibase',
  'Keycloak',
  'Linux',
])

/** My CV as a few small tables, for the SQL console. */
export const cvDatabase: Database = {
  about: {
    columns: [
      { name: 'key', type: 'text' },
      { name: 'value', type: 'text' },
    ],
    rows: [
      { key: 'name', value: profile.name },
      { key: 'role', value: 'Software Engineer' },
      { key: 'lives_in', value: 'Paredes, Portugal' },
      { key: 'works_at', value: 'ANO Software, Porto' },
      { key: 'email', value: profile.email },
      { key: 'speaks', value: 'Portuguese, English' },
    ],
  },
  experience: {
    columns: [
      { name: 'role', type: 'text' },
      { name: 'company', type: 'text' },
      { name: 'city', type: 'text' },
      { name: 'started', type: 'text' },
      { name: 'ended', type: 'text', nullable: true },
    ],
    rows: [{ role: 'Software Engineer', company: 'ANO Software', city: 'Porto', started: '2023-09', ended: null }],
  },
  education: {
    columns: [
      { name: 'course', type: 'text' },
      { name: 'school', type: 'text' },
      { name: 'started', type: 'integer' },
      { name: 'ended', type: 'integer' },
    ],
    rows: [
      { course: 'Computer Engineering', school: 'UTAD', started: 2020, ended: 2023 },
      { course: 'Secondary school', school: 'Escola Secundária de Paredes', started: 2017, ended: 2020 },
    ],
  },
  projects: {
    columns: [
      { name: 'name', type: 'text' },
      { name: 'stack', type: 'text' },
      { name: 'repo', type: 'text' },
    ],
    rows: Object.values(projects).map((p) => ({
      name: p.title,
      stack: p.stack.join(', '),
      repo: p.link.replace('https://', ''),
    })),
  },
  skills: {
    columns: [
      { name: 'name', type: 'text' },
      { name: 'category', type: 'text' },
      { name: 'at_work', type: 'boolean' },
    ],
    rows: skills.flatMap((group) =>
      group.items.map((name) => ({ name, category: group.label, at_work: AT_WORK.has(name) })),
    ),
  },
}
