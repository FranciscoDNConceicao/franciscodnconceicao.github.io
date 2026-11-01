import stockFinanceImage from '../assets/projects/stock-finance.webp'
import qboCameraImage from '../assets/projects/qbo-camera.webp'
import qboRobotImage from '../assets/projects/qbo-robot.webp'
import gammingHourPoster from '../assets/projects/gamming-hour-poster.webp'
import gammingHourVideo from '../assets/projects/gamming-hour.mp4'

export const profile = {
  name: 'Francisco Conceição',
  fullName: 'Francisco Diogo Nunes da Conceição',
  role: 'Software Engineer',
  location: 'Paredes, Portugal',
  email: 'franciscodnconceicao@gmail.com',
  github: 'https://github.com/FranciscoDNConceicao',
  linkedin: 'https://linkedin.com/in/franciscoconceicao14/',
  repo: 'https://github.com/FranciscoDNConceicao/franciscodnconceicao.github.io',
  cv: '/Francisco-Conceicao-CV.pdf',
  photo: '/images/francisco.webp',
}

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof sections)[number]['id']

/** In my own words, from my CV profile and the previous version of this site. */
export const story = {
  lead: "Ever since I can remember, I've been fascinated by technology and its potential to solve real-world problems.",
  paragraphs: [
    'That fascination led me to study Computer Engineering at UTAD. Today I work as a software engineer in Porto, and the curiosity is exactly the same.',
    "I thrive on continuous learning. Whether it's experimenting with a new programming language, exploring a framework or working through a tricky algorithm, I enjoy the challenge, and I always want to understand the principles behind the tools I use.",
  ],
}

export const drivers = [
  { title: 'Curiosity', text: 'Understanding how things work underneath, not just how to use them.' },
  { title: 'Continuous learning', text: 'New languages, new frameworks, new problems. Each one is a chance to get better.' },
  { title: 'Growth', text: 'Challenging myself to improve, both personally and professionally.' },
]

export interface Milestone {
  period: string
  title: string
  place: string
  text?: string
  tags?: string[]
  current?: boolean
}

export const journey: Milestone[] = [
  {
    period: '2023 — Now',
    title: 'Software Engineer',
    place: 'ANO Software · Porto',
    text: 'Building enterprise software end to end, from PostgreSQL to Java, Python and React. Along the way I designed single sign-on with Keycloak and helped build a new platform from scratch.',
    tags: ['Java', 'Spring Boot', 'Python', 'PostgreSQL', 'React', 'Docker'],
    current: true,
  },
  {
    period: '2020 — 2023',
    title: 'Computer Engineering',
    place: 'Universidade de Trás-os-Montes e Alto Douro',
    text: 'Where I sharpened my skills and found my love for coding, through software development with C, C++, C#, ASP.NET MVC, HTML and CSS.',
    tags: ['C', 'C++', 'C#', 'ASP.NET MVC', 'HTML', 'CSS'],
  },
  {
    period: '2017 — 2020',
    title: 'Secondary school',
    place: 'Escola Secundária de Paredes',
  },
]

export interface Project {
  id: string
  index: string
  title: string
  kind: string
  description: string
  stack: string[]
  link: string
}

export const projects = {
  stockFinance: {
    id: 'stock-finance',
    index: '01',
    title: 'Stock Finance',
    kind: 'Full-stack web app',
    description:
      'A trading dashboard for viewing, buying and selling stocks, with company information, a market ticker and news. React and TypeScript on the front end; a Python server with FastAPI and SQLAlchemy over PostgreSQL.',
    stack: ['React', 'TypeScript', 'Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
    link: 'https://github.com/FranciscoDNConceicao/Stock-Finance',
    image: stockFinanceImage,
  },
  qbo: {
    id: 'qbo',
    index: '02',
    title: 'Robot Q.BO',
    kind: 'Computer vision',
    description:
      'Taught a Q.bo One robot to detect and recognise people in its field of view, driving the servos in its head to follow them. Recognition uses the LBPH algorithm from OpenCV.',
    stack: ['Python', 'OpenCV', 'Linux'],
    link: 'https://github.com/FranciscoDNConceicao/Robot-QBO-using-Face-Recognition',
    image: qboCameraImage,
    robot: qboRobotImage,
  },
  gammingHour: {
    id: 'gamming-hour',
    index: '03',
    title: 'The Gamming Hour',
    kind: 'E-commerce web app',
    description:
      'A games store where customers browse by console, category and producer, keep a list of preferred categories and review the games they have bought.',
    stack: ['C#', 'ASP.NET MVC'],
    link: 'https://github.com/FranciscoDNConceicao/TheGammingHour',
    poster: gammingHourPoster,
    video: gammingHourVideo,
  },
}

/** Places a skill has been used, so the Skills section can show evidence. */
export const contexts = [
  { id: 'ano', label: 'ANO Software', kind: 'Work' },
  { id: 'stock', label: 'Stock Finance', kind: 'Project' },
  { id: 'qbo', label: 'Robot Q.BO', kind: 'Project' },
  { id: 'tgh', label: 'The Gamming Hour', kind: 'Project' },
  { id: 'site', label: 'This website', kind: 'Project' },
  { id: 'utad', label: 'UTAD', kind: 'Degree' },
] as const

export type ContextId = (typeof contexts)[number]['id']

export interface Skill {
  name: string
  usedIn: ContextId[]
}

export const skillGroups: { label: string; skills: Skill[] }[] = [
  {
    label: 'Languages',
    skills: [
      { name: 'Java', usedIn: ['ano'] },
      { name: 'Python', usedIn: ['ano', 'stock', 'qbo'] },
      { name: 'TypeScript', usedIn: ['ano', 'stock', 'site'] },
      { name: 'C#', usedIn: ['tgh', 'utad'] },
      { name: 'SQL', usedIn: ['ano', 'stock'] },
    ],
  },
  {
    label: 'Frameworks',
    skills: [
      { name: 'Spring Boot', usedIn: ['ano'] },
      { name: 'React', usedIn: ['ano', 'stock', 'site'] },
      { name: 'Vite', usedIn: ['ano', 'site'] },
      { name: 'HTML', usedIn: ['tgh', 'site', 'utad'] },
      { name: 'CSS', usedIn: ['tgh', 'site', 'utad'] },
      { name: 'Maven', usedIn: [] },
    ],
  },
  {
    label: 'Databases',
    skills: [
      { name: 'PostgreSQL', usedIn: ['ano', 'stock'] },
      { name: 'Oracle', usedIn: [] },
      { name: 'SQL Server', usedIn: ['utad'] },
    ],
  },
  {
    label: 'Tools',
    skills: [
      { name: 'Docker', usedIn: ['ano'] },
      { name: 'Git', usedIn: ['site'] },
      { name: 'GitLab', usedIn: [] },
      { name: 'Liquibase', usedIn: ['ano'] },
      { name: 'Linux', usedIn: ['ano', 'qbo'] },
      { name: 'Keycloak · OAuth2', usedIn: ['ano'] },
    ],
  },
]

export const spokenLanguages = [
  { name: 'Portuguese', level: 'Native' },
  { name: 'English', level: 'Professional working' },
]
