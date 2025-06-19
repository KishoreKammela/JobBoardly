import React from 'react';
import type {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import { formatCurrencyINR } from '@/lib/utils';

interface PrintableProfileProps {
  user: UserProfile;
}

// Define reasonable truncation limits for PDF
const MAX_SUMMARY_LENGTH = 750;
const MAX_EXPERIENCE_DESC_LENGTH = 250;
const MAX_EDUCATION_DESC_LENGTH = 200;

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '... (truncated)';
};

const PrintableProfileComponent = React.forwardRef<
  HTMLDivElement,
  PrintableProfileProps
>(({ user }, ref) => {
  if (!user || user.role !== 'jobSeeker') {
    return (
      <div ref={ref}>
        <p>Not a job seeker profile or no user data.</p>
      </div>
    );
  }

  const hasTruncatedContent =
    (user.parsedResumeText &&
      user.parsedResumeText.length > MAX_SUMMARY_LENGTH) ||
    (user.experiences || []).some(
      (exp) =>
        exp.description && exp.description.length > MAX_EXPERIENCE_DESC_LENGTH
    ) ||
    (user.educations || []).some(
      (edu) =>
        edu.description && edu.description.length > MAX_EDUCATION_DESC_LENGTH
    );

  return (
    <div
      ref={ref}
      className="p-8 font-body bg-white text-black text-sm printable-profile"
    >
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .printable-profile {
            font-size: 9pt;
            line-height: 1.3;
            color: #333 !important;
          }
          .printable-profile h1,
          .printable-profile h2,
          .printable-profile h3 {
            color: #111 !important;
            margin-bottom: 0.3rem;
          }
          .printable-profile h1 {
            font-size: 1.6rem;
          }
          .printable-profile h2 {
            font-size: 1.2rem;
            margin-top: 0.8rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.2rem;
          }
          .printable-profile h3 {
            font-size: 1rem;
          }
          .printable-profile strong {
            font-weight: 600;
          }
          .printable-profile a {
            color: #0056b3 !important;
            text-decoration: none;
          }
          .printable-profile hr {
            border-top: 1px solid #ddd;
            margin: 0.7rem 0;
          }
          .printable-profile ul {
            margin-left: 1.2rem;
            list-style-type: disc;
          }
          .printable-profile .section {
            margin-bottom: 0.8rem;
            page-break-inside: avoid;
          }
          .printable-profile .header {
            text-align: center;
            margin-bottom: 1rem;
            page-break-after: avoid;
          }
          .printable-profile .header p {
            margin: 0.1rem 0;
            font-size: 0.8rem;
          }
          .printable-profile .skills-list,
          .languages-list-pdf {
            display: flex;
            flex-wrap: wrap;
            gap: 0.3rem;
            margin-top: 0.3rem;
          }
          .printable-profile .skill-badge,
          .language-badge-pdf {
            background-color: #f0f0f0;
            padding: 0.2rem 0.4rem;
            border-radius: 0.2rem;
            font-size: 0.75rem;
          }
          .printable-profile .entry-item {
            margin-bottom: 0.6rem;
            page-break-inside: avoid;
          }
          .printable-profile .item-title {
            font-weight: bold;
            font-size: 0.9rem;
          }
          .printable-profile .item-subtitle {
            font-size: 0.8rem;
            color: #555 !important;
            margin-bottom: 0.15rem;
          }
          .printable-profile .item-description {
            white-space: pre-wrap;
            font-size: 0.8rem;
            margin-left: 0.5rem;
            padding-left: 0.5rem;
            border-left: 1px solid #eee;
          }
          .printable-profile .footer-note {
            margin-top: 1.5rem;
            font-size: 0.7rem;
            color: #777 !important;
            text-align: center;
          }
          .printable-profile .grid-cols-2-pdf {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.5rem;
          }
          .printable-profile .grid-cols-3-pdf {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem;
          }
          .printable-profile .flex-pdf {
            display: flex;
          }
          .printable-profile .gap-2-pdf {
            gap: 0.5rem;
          }
          .printable-profile .items-center-pdf {
            align-items: center;
          }
        }
        .printable-profile {
          font-family: 'Inter', sans-serif;
          max-width: 780px;
          margin: auto;
        }
      `}</style>

      <div className="header">
        <h1>{user.name}</h1>
        {user.headline && <p>{user.headline}</p>}
        <p
          className="flex-pdf gap-2-pdf items-center-pdf"
          style={{ justifyContent: 'center' }}
        >
          {user.email && <span>{user.email}</span>}
          {user.mobileNumber && (
            <>
              <span>|</span> <span>{user.mobileNumber}</span>
            </>
          )}
          {user.homeCity && user.homeState && (
            <>
              <span>|</span>{' '}
              <span>
                {user.homeCity}, {user.homeState}
              </span>
            </>
          )}
        </p>
        <p
          className="flex-pdf gap-2-pdf items-center-pdf"
          style={{ justifyContent: 'center' }}
        >
          {user.portfolioUrl && (
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Portfolio
            </a>
          )}
          {user.linkedinUrl && (
            <>
              {user.portfolioUrl && <span>|</span>}{' '}
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </>
          )}
        </p>
      </div>

      {user.parsedResumeText && (
        <div className="section">
          <h2>Summary</h2>
          <p className="item-description">
            {truncateText(user.parsedResumeText, MAX_SUMMARY_LENGTH)}
          </p>
        </div>
      )}

      {user.experiences && user.experiences.length > 0 && (
        <div className="section">
          <h2>Work Experience</h2>
          {user.experiences.map((exp: ExperienceEntry) => (
            <div key={exp.id} className="entry-item">
              <h3 className="item-title">
                {exp.jobRole} at {exp.companyName}
              </h3>
              <p className="item-subtitle">
                {exp.startDate
                  ? new Date(exp.startDate + '-02').toLocaleDateString(
                      'en-US',
                      { month: 'short', year: 'numeric' }
                    )
                  : 'N/A'}{' '}
                -
                {exp.currentlyWorking
                  ? 'Present'
                  : exp.endDate
                    ? new Date(exp.endDate + '-02').toLocaleDateString(
                        'en-US',
                        { month: 'short', year: 'numeric' }
                      )
                    : 'N/A'}
                {exp.annualCTC && ` | CTC: ${formatCurrencyINR(exp.annualCTC)}`}
              </p>
              {exp.description && (
                <p className="item-description">
                  {truncateText(exp.description, MAX_EXPERIENCE_DESC_LENGTH)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {user.educations && user.educations.length > 0 && (
        <div className="section">
          <h2>Education</h2>
          {user.educations.map((edu: EducationEntry) => (
            <div key={edu.id} className="entry-item">
              <h3 className="item-title">
                {edu.degreeName}{' '}
                {edu.isMostRelevant && (
                  <span style={{ fontSize: '0.7rem', color: '#0056b3' }}>
                    (Most Relevant)
                  </span>
                )}
              </h3>
              <p className="item-subtitle">
                {edu.instituteName} | {edu.level}
                {edu.specialization && ` - ${edu.specialization}`}
                {edu.startYear &&
                  edu.endYear &&
                  ` | ${edu.startYear} - ${edu.endYear}`}
                {edu.courseType && ` (${edu.courseType})`}
              </p>
              {edu.description && (
                <p className="item-description">
                  {truncateText(edu.description, MAX_EDUCATION_DESC_LENGTH)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid-cols-2-pdf section">
        <div>
          <h2>Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="skills-list">
              {user.skills.map((skill, index) => (
                <span key={`${skill}-${index}`} className="skill-badge">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p>N/A</p>
          )}
        </div>
        <div>
          <h2>Languages</h2>
          {user.languages && user.languages.length > 0 ? (
            <div className="languages-list-pdf">
              {user.languages.map((lang: LanguageEntry) => (
                <span key={lang.id} className="language-badge-pdf">
                  {lang.languageName} ({lang.proficiency.substring(0, 3)}.
                  {lang.canRead && 'R'}
                  {lang.canWrite && 'W'}
                  {lang.canSpeak && 'S'})
                </span>
              ))}
            </div>
          ) : (
            <p>N/A</p>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Additional Information</h2>
        <div className="grid-cols-2-pdf">
          {user.dateOfBirth && (
            <p>
              <strong>Date of Birth:</strong>{' '}
              {new Date(user.dateOfBirth).toLocaleDateString()}
            </p>
          )}
          {user.gender && (
            <p>
              <strong>Gender:</strong> {user.gender}
            </p>
          )}
          {user.preferredLocations && user.preferredLocations.length > 0 && (
            <p>
              <strong>Preferred Locations:</strong>{' '}
              {user.preferredLocations.join(', ')}
            </p>
          )}
          {user.availability && (
            <p>
              <strong>Availability:</strong> {user.availability}
            </p>
          )}
          {user.jobSearchStatus && (
            <p>
              <strong>Job Search Status:</strong>{' '}
              {user.jobSearchStatus
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
            </p>
          )}
          {user.currentCTCValue !== undefined && (
            <p>
              <strong>Current CTC:</strong>{' '}
              {formatCurrencyINR(user.currentCTCValue)}/year{' '}
              {user.currentCTCConfidential && '(Confidential)'}
            </p>
          )}
          {user.expectedCTCValue !== undefined && (
            <p>
              <strong>Expected CTC:</strong>{' '}
              {formatCurrencyINR(user.expectedCTCValue)}/year{' '}
              {user.expectedCTCNegotiable && '(Negotiable)'}
            </p>
          )}
        </div>
      </div>

      {hasTruncatedContent && (
        <div className="footer-note">
          Note: Some detailed descriptions may have been truncated for brevity.
          For the full profile, please view online if available.
        </div>
      )}
    </div>
  );
});

PrintableProfileComponent.displayName = 'PrintableProfileComponent';
export { PrintableProfileComponent };
