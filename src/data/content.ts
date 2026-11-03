import stockFinanceImage from '../assets/projects/stock-finance.webp'
import qboCameraImage from '../assets/projects/qbo-camera.webp'
import qboRobotImage from '../assets/projects/qbo-robot.webp'
import gammingHourPoster from '../assets/projects/gamming-hour-poster.webp'
import gammingHourVideo from '../assets/projects/gamming-hour.mp4'

export const profile = {
  name: 'Francisco Conceição',
  email: 'franciscodnconceicao@gmail.com',
  github: 'https://github.com/FranciscoDNConceicao',
  linkedin: 'https://linkedin.com/in/franciscoconceicao14/',
  repo: 'https://github.com/FranciscoDNConceicao/franciscodnconceicao.github.io',
  cv: '/Francisco-Conceicao-CV.pdf',
  photo: '/images/francisco.webp',
}

export const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'lab', label: 'Lab' },
  { id: 'contact', label: 'Contact' },
] as const

export const intro =
  "I'm a software engineer from Paredes, Portugal. I work at ANO Software in Porto, mostly with Java, Python, PostgreSQL and React."

export const about = [
  "I've always liked figuring out how things work. That's what got me into Computer Engineering at UTAD, and it's still my favourite part of the job: digging into something until I really understand it, and then making it better.",
  "Since September 2023 I've been at ANO Software, working on two ERP platforms. One is a Python system that clients use every day. The other is a new one we're building from scratch with Java, Spring Boot and React. I built its login (Keycloak, with single sign-on between the two ERPs) and the first version of its React frontend.",
  "On my own time I like trying things I don't use at work yet: a new language, a framework, or a good algorithm problem.",
]

export const facts = [
  { label: 'Lives in', value: 'Paredes, Portugal' },
  { label: 'Works at', value: 'ANO Software, Porto' },
  { label: 'Studied', value: 'Computer Engineering, UTAD' },
  { label: 'Speaks', value: 'Portuguese, English' },
]

export interface Role {
  period: string
  title: string
  place: string
  text?: string
}

export const experience: Role[] = [
  {
    period: 'Sep 2023 – now',
    title: 'Software Engineer',
    place: 'ANO Software, Porto',
    text: "I split my time between FutureERP-R3, a Python and PostgreSQL ERP where I add features, fix bugs and look into client tickets, and FutureERP-R4, its replacement in Java 21, Spring Boot and React. On R4 I built the Keycloak login with single sign-on and the first React frontend, and I also write REST APIs, Liquibase migrations and the Docker setup we ship to clients' Linux servers.",
  },
  {
    period: 'Sep 2020 – Jun 2023',
    title: 'Computer Engineering',
    place: 'Universidade de Trás-os-Montes e Alto Douro',
    text: 'Mostly software development: C, C++, C#, ASP.NET MVC, HTML and CSS.',
  },
  {
    period: '2017 – 2020',
    title: 'Secondary school',
    place: 'Escola Secundária de Paredes',
  },
]

export const projects = {
  stockFinance: {
    title: 'Stock Finance',
    description:
      'A web app for following, buying and selling stocks, with company info and market news. I wrote the frontend in React and TypeScript and the backend in Python with FastAPI and SQLAlchemy, on top of PostgreSQL.',
    stack: ['React', 'TypeScript', 'FastAPI', 'SQLAlchemy', 'PostgreSQL'],
    link: 'https://github.com/FranciscoDNConceicao/Stock-Finance',
    image: stockFinanceImage,
  },
  qbo: {
    title: 'Robot Q.BO',
    description:
      "I programmed a Q.bo One robot to spot people, recognise their faces with OpenCV's LBPH recogniser and turn its head to follow them. Bit, up at the top of this page, is loosely based on it.",
    stack: ['Python', 'OpenCV', 'Linux'],
    link: 'https://github.com/FranciscoDNConceicao/Robot-QBO-using-Face-Recognition',
    image: qboCameraImage,
    robot: qboRobotImage,
  },
  gammingHour: {
    title: 'The Gamming Hour',
    description:
      "An online games store in C# and ASP.NET MVC. You can browse games by console, category or producer, pick your favourite categories and see what you've bought.",
    stack: ['C#', 'ASP.NET MVC'],
    link: 'https://github.com/FranciscoDNConceicao/TheGammingHour',
    poster: gammingHourPoster,
    video: gammingHourVideo,
  },
}

export const skills = [
  { label: 'Languages', items: ['Java', 'Python', 'TypeScript', 'C#', 'SQL'] },
  { label: 'Frameworks', items: ['Spring Boot', 'React', 'Vite', 'Maven', 'HTML and CSS'] },
  { label: 'Databases', items: ['PostgreSQL', 'Oracle', 'SQL Server'] },
  { label: 'Tools', items: ['Docker', 'Git', 'GitLab', 'Liquibase', 'Keycloak', 'Linux'] },
]
