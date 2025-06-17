import type { Job, UserProfile, UserSettings } from '@/types';

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Software Engineer, Frontend',
    company: 'Innovatech Solutions',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Join our dynamic team to build cutting-edge user interfaces for our flagship product. Proficiency in React, TypeScript, and Next.js required.',
    postedDate: '2024-07-20',
    isRemote: false,
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    salaryMin: 120000,
    salaryMax: 160000,
    companyLogoUrl: 'https://placehold.co/100x100.png?text=IS',
  },
  {
    id: '2',
    title: 'Product Manager, AI Platform',
    company: 'AI Core Inc.',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Lead the product strategy for our revolutionary AI platform. Strong experience in AI/ML products and agile methodologies needed.',
    postedDate: '2024-07-18',
    isRemote: true,
    skills: ['Product Management', 'AI/ML', 'Agile', 'Roadmapping'],
    salaryMin: 150000,
    salaryMax: 190000,
    companyLogoUrl: 'https://placehold.co/100x100.png?text=AI',
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Creative Visions',
    location: 'Remote',
    type: 'Contract',
    description: 'Seeking a talented UX Designer to create intuitive and engaging user experiences for various web and mobile applications.',
    postedDate: '2024-07-22',
    isRemote: true,
    skills: ['UX Design', 'Figma', 'User Research', 'Prototyping'],
    companyLogoUrl: 'https://placehold.co/100x100.png?text=CV',
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'CloudNetics',
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Implement and manage CI/CD pipelines, monitor infrastructure, and ensure high availability of our cloud services. AWS and Kubernetes expertise is a must.',
    postedDate: '2024-07-15',
    isRemote: false,
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
    salaryMin: 130000,
    salaryMax: 170000,
    companyLogoUrl: 'https://placehold.co/100x100.png?text=CN',
  },
    {
    id: '5',
    title: 'Data Scientist',
    company: 'Data Insights Co.',
    location: 'Boston, MA',
    type: 'Full-time',
    description: 'Analyze large datasets to extract meaningful insights and build predictive models. Proficiency in Python, R, and machine learning algorithms.',
    postedDate: '2024-07-25',
    isRemote: false,
    skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL'],
    salaryMin: 110000,
    salaryMax: 150000,
    companyLogoUrl: 'https://placehold.co/100x100.png?text=DI',
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    company: 'Web Wizards LLC',
    location: 'Remote',
    type: 'Part-time',
    description: 'Develop and maintain web applications using Node.js, Express, React, and PostgreSQL. Opportunity to work on diverse projects.',
    postedDate: '2024-07-23',
    isRemote: true,
    skills: ['Node.js', 'Express', 'React', 'PostgreSQL', 'REST APIs'],
    companyLogoUrl: 'https://placehold.co/100x100.png?text=WW',
  },
];

export const mockUserProfile: UserProfile = {
  id: 'user123',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=JD',
  skills: ['JavaScript', 'React', 'Node.js', 'Project Management'],
  experience: `
### Senior Software Engineer at Tech Solutions Inc. (2020 - Present)
- Led development of key features for a SaaS product.
- Mentored junior engineers and improved team coding standards.

### Software Engineer at Web Creations LLC (2017 - 2020)
- Developed and maintained client websites using WordPress and custom PHP.
  `,
  resumeUrl: '#',
  resumeFileName: 'JaneDoe_Resume.pdf',
  parsedResumeText: 'Skills: JavaScript, React, Node.js, Project Management. Experience: Senior Software Engineer at Tech Solutions Inc. ...'
};

export const defaultUserSettings: UserSettings = {
  jobBoardDisplay: 'list',
  itemsPerPage: 10,
  jobAlerts: {
    newJobsMatchingProfile: true,
    savedSearchAlerts: false,
    applicationStatusUpdates: true,
  },
  searchHistory: ['Software Engineer remote', 'Product Manager New York', 'UX Designer contract'],
};
