
import type { Job, UserProfile, UserSettings } from '@/types';

export const mockEmployerProfiles: UserProfile[] = [
  {
    id: 'employer1',
    role: 'employer',
    name: 'Innovatech Solutions',
    email: 'hr@innovatech.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=IS',
    companyWebsite: 'https://innovatech.com',
    companyDescription: 'Innovatech Solutions is a leading provider of cutting-edge technology solutions, specializing in AI and cloud computing. We foster a collaborative and innovative work environment.',
  },
  {
    id: 'employer2',
    role: 'employer',
    name: 'AI Core Inc.',
    email: 'careers@aicore.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=AI',
    companyWebsite: 'https://aicore.com',
    companyDescription: 'AI Core Inc. is at the forefront of artificial intelligence research and development, building platforms that power the next generation of smart applications.',
  }
];

export const mockJobSeekerProfiles: UserProfile[] = [
  {
    id: 'user123',
    role: 'jobSeeker',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=JD',
    headline: 'Experienced Full Stack Developer',
    skills: ['JavaScript', 'React', 'Node.js', 'Project Management', 'TypeScript', 'Next.js'],
    experience: `
### Senior Software Engineer at Tech Solutions Inc. (2020 - Present)
- Led development of key features for a SaaS product using React, Node.js, and TypeScript.
- Mentored junior engineers and improved team coding standards.
- Contributed to architectural decisions and CI/CD pipeline improvements.

### Software Engineer at Web Creations LLC (2017 - 2020)
- Developed and maintained client websites using WordPress and custom PHP.
- Collaborated with designers to implement responsive and user-friendly interfaces.
  `,
    education: "B.S. in Computer Science - University of California, Berkeley",
    availability: "2 Weeks Notice",
    portfolioUrl: 'https://jane.dev',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
    preferredLocations: ['San Francisco, CA', 'Remote'],
    jobSearchStatus: 'activelyLooking',
    desiredSalary: 140000,
    resumeUrl: '#', 
    resumeFileName: 'JaneDoe_Resume.pdf',
    parsedResumeText: 'Skills: JavaScript, React, Node.js, Project Management, TypeScript, Next.js. Experience: Senior Software Engineer at Tech Solutions Inc. specializing in full-stack development...',
    appliedJobIds: ['1'], // Jane has applied to job '1'
  },
  {
    id: 'user456',
    role: 'jobSeeker',
    name: 'John Smith',
    email: 'john.smith@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=JS',
    headline: 'Creative UX Designer & Researcher',
    skills: ['UX Design', 'Figma', 'User Research', 'Prototyping', 'Adobe XD', 'Wireframing'],
    experience: `
### Lead UX Designer at DesignWorks (2019 - Present)
- Spearheaded user experience strategy for flagship mobile and web applications.
- Conducted extensive user research, usability testing, and persona development.
- Managed a team of 3 junior designers.

### UX/UI Designer at StartupX (2016 - 2019)
- Designed interfaces for early-stage products, iterating based on user feedback.
- Created wireframes, mockups, and interactive prototypes.
  `,
    education: "M.A. in Human-Computer Interaction - Stanford University",
    availability: "Immediate",
    portfolioUrl: 'https://johnsmith.design',
    linkedinUrl: 'https://linkedin.com/in/johnsmithux',
    preferredLocations: ['New York, NY', 'Remote'],
    jobSearchStatus: 'openToOpportunities',
    desiredSalary: 120000,
    appliedJobIds: [],
  },
  {
    id: 'user789',
    role: 'jobSeeker',
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    avatarUrl: 'https://placehold.co/100x100.png?text=AB',
    headline: 'Data Scientist | Machine Learning Enthusiast',
    skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL', 'TensorFlow', 'PyTorch'],
    experience: `
### Data Scientist at DataDriven Corp (2021 - Present)
- Developed and deployed machine learning models for predictive analytics.
- Performed data mining and statistical analysis to uncover business insights.
- Communicated complex findings to non-technical stakeholders.
    `,
    education: "Ph.D. in Data Science - MIT",
    availability: "1 Month Notice",
    portfolioUrl: 'https://alicebrown.data',
    linkedinUrl: 'https://linkedin.com/in/alicebrowndata',
    preferredLocations: ['Boston, MA', 'Remote'],
    jobSearchStatus: 'activelyLooking',
    desiredSalary: 160000,
    appliedJobIds: ['5'],
  }
];

// For direct use when needed, or for AuthContext's initial login.
export const mockUserProfile: UserProfile = mockJobSeekerProfiles[0]; 
export const mockEmployerProfile: UserProfile = mockEmployerProfiles[0];


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
    companyLogoUrl: mockEmployerProfiles[0].avatarUrl,
    postedById: mockEmployerProfiles[0].id,
    applicantIds: [mockJobSeekerProfiles[0].id, mockJobSeekerProfiles[2].id], // Jane and Alice applied
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
    companyLogoUrl: mockEmployerProfiles[1].avatarUrl,
    postedById: mockEmployerProfiles[1].id,
    applicantIds: [mockJobSeekerProfiles[1].id], // John applied
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Innovatech Solutions', // Changed company to match an employer
    location: 'Remote',
    type: 'Contract',
    description: 'Seeking a talented UX Designer to create intuitive and engaging user experiences for various web and mobile applications.',
    postedDate: '2024-07-22',
    isRemote: true,
    skills: ['UX Design', 'Figma', 'User Research', 'Prototyping'],
    companyLogoUrl: mockEmployerProfiles[0].avatarUrl,
    postedById: mockEmployerProfiles[0].id,
    applicantIds: [],
  },
  {
    id: '4',
    title: 'DevOps Engineer',
    company: 'AI Core Inc.', // Changed company
    location: 'Austin, TX',
    type: 'Full-time',
    description: 'Implement and manage CI/CD pipelines, monitor infrastructure, and ensure high availability of our cloud services. AWS and Kubernetes expertise is a must.',
    postedDate: '2024-07-15',
    isRemote: false,
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
    salaryMin: 130000,
    salaryMax: 170000,
    companyLogoUrl: mockEmployerProfiles[1].avatarUrl,
    postedById: mockEmployerProfiles[1].id,
    applicantIds: [mockJobSeekerProfiles[0].id],
  },
    {
    id: '5',
    title: 'Data Scientist',
    company: 'Innovatech Solutions',
    location: 'Boston, MA',
    type: 'Full-time',
    description: 'Analyze large datasets to extract meaningful insights and build predictive models. Proficiency in Python, R, and machine learning algorithms.',
    postedDate: '2024-07-25',
    isRemote: false,
    skills: ['Python', 'R', 'Machine Learning', 'Statistics', 'SQL'],
    salaryMin: 110000,
    salaryMax: 150000,
    companyLogoUrl: mockEmployerProfiles[0].avatarUrl,
    postedById: mockEmployerProfiles[0].id,
    applicantIds: [mockJobSeekerProfiles[2].id],
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    company: 'AI Core Inc.',
    location: 'Remote',
    type: 'Part-time',
    description: 'Develop and maintain web applications using Node.js, Express, React, and PostgreSQL. Opportunity to work on diverse projects.',
    postedDate: '2024-07-23',
    isRemote: true,
    skills: ['Node.js', 'Express', 'React', 'PostgreSQL', 'REST APIs'],
    companyLogoUrl: mockEmployerProfiles[1].avatarUrl,
    postedById: mockEmployerProfiles[1].id,
    applicantIds: [],
  },
];


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
