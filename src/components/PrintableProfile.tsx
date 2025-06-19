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
const MAX_SUMMARY_LENGTH = 800; // Increased slightly
const MAX_EXPERIENCE_DESC_LENGTH = 300; // Increased slightly
const MAX_EDUCATION_DESC_LENGTH = 250; // Increased slightly

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '... (truncated)';
};

const PrintableProfileComponent = React.forwardRef<
  HTMLDivElement,
  PrintableProfileProps
>(({ user }, ref) => {
  if (!user) {
    // Simplified check, role check can be done by caller
    return (
      <div ref={ref} className="p-8 font-body bg-white text-black text-sm">
        <p>No user data provided for printing.</p>
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
          .printable-profile h3,
          .printable-profile h4 {
            /* Added h4 */
            color: #111 !important;
            margin-bottom: 0.3rem;
            font-family: 'Inter', sans-serif; /* Ensure consistent font */
          }
          .printable-profile h1 {
            font-size: 18pt; /* Adjusted for better hierarchy */
            font-weight: 700;
          }
          .printable-profile h2 {
            font-size: 14pt; /* Adjusted */
            font-weight: 600;
            margin-top: 1rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.2rem;
          }
          .printable-profile h3 {
            /* For Experience/Education titles */
            font-size: 11pt;
            font-weight: 600;
            margin-bottom: 0.1rem;
          }
          .printable-profile h4 {
            /* For sub-headings like Company/Institute */
            font-size: 10pt;
            font-weight: 500;
            color: #444 !important;
            margin-bottom: 0.1rem;
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
            margin: 0.8rem 0;
          }
          .printable-profile ul.compact-list {
            /* For skills/languages */
            margin-left: 0;
            padding-left: 0;
            list-style-type: none;
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .printable-profile ul.compact-list li {
            background-color: #f0f0f0;
            padding: 0.15rem 0.4rem;
            border-radius: 0.2rem;
            font-size: 8pt;
          }
          .printable-profile .section {
            margin-bottom: 1rem; /* Increased spacing */
            page-break-inside: avoid;
          }
          .printable-profile .header {
            text-align: center;
            margin-bottom: 1.2rem;
            page-break-after: avoid;
          }
          .printable-profile .header p {
            margin: 0.1rem 0;
            font-size: 9pt;
            color: #555 !important;
          }
          .printable-profile .entry-item {
            margin-bottom: 0.8rem; /* Increased spacing */
            page-break-inside: avoid;
          }
          .printable-profile .item-meta {
            /* For dates/CTC */
            font-size: 8pt;
            color: #666 !important;
            margin-bottom: 0.2rem;
          }
          .printable-profile .item-description {
            white-space: pre-wrap;
            font-size: 9pt;
            margin-left: 0; /* Removed indent for more space */
            padding-left: 0;
            border-left: none;
          }
          .printable-profile .footer-note {
            margin-top: 1.5rem;
            font-size: 7pt;
            color: #777 !important;
            text-align: center;
            page-break-before: auto; /* Allow break if it's at page bottom */
          }
          .printable-profile .grid-2-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .printable-profile .contact-info span {
            margin-right: 0.7rem;
          }
          .printable-profile .contact-info span:last-child {
            margin-right: 0;
          }
        }
        .printable-profile {
          /* Base styles for screen, if needed */
          font-family: 'Inter', sans-serif;
          max-width: 800px; /* A bit wider for screen if needed */
          margin: auto;
          line-height: 1.5;
        }
      `}</style>

      <div className="header">
        <h1>{user.name}</h1>
        {user.headline && <p>{user.headline}</p>}
        <p className="contact-info">
          {user.email && <span>{user.email}</span>}
          {user.mobileNumber && (
            <>
              {user.email && <span>&bull;</span>}{' '}
              <span>{user.mobileNumber}</span>
            </>
          )}
          {(user.homeCity || user.homeState) && (
            <>
              {(user.email || user.mobileNumber) && <span>&bull;</span>}
              <span>
                {user.homeCity}
                {user.homeCity && user.homeState ? ', ' : ''}
                {user.homeState}
              </span>
            </>
          )}
        </p>
        <p className="contact-info">
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
              {user.portfolioUrl && <span>&bull;</span>}{' '}
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
              <h3>{exp.jobRole}</h3>
              <h4>{exp.companyName}</h4>
              <p className="item-meta">
                {exp.startDate
                  ? new Date(exp.startDate + '-02').toLocaleDateString(
                      'en-US',
                      { month: 'short', year: 'numeric' }
                    )
                  : 'N/A'}{' '}
                -
                {exp.currentlyWorking
                  ? ' Present'
                  : exp.endDate
                    ? new Date(exp.endDate + '-02').toLocaleDateString(
                        'en-US',
                        { month: 'short', year: 'numeric' }
                      )
                    : ' N/A'}
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
              <h3>
                {edu.degreeName}
                {edu.specialization && `, ${edu.specialization}`}
                {edu.isMostRelevant && (
                  <span
                    style={{
                      fontSize: '0.8em',
                      color: '#0056b3',
                      marginLeft: '5px',
                    }}
                  >
                    (Most Relevant)
                  </span>
                )}
              </h3>
              <h4>
                {edu.instituteName} ({edu.level})
              </h4>
              <p className="item-meta">
                {edu.startYear && edu.endYear
                  ? `${edu.startYear} - ${edu.endYear}`
                  : edu.endYear || 'N/A'}
                {edu.courseType && ` | ${edu.courseType}`}
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

      <div className="grid-2-col section">
        <div>
          <h2>Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <ul className="compact-list">
              {user.skills.map((skill, index) => (
                <li key={`skill-${index}`}>{skill}</li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>
        <div>
          <h2>Languages</h2>
          {user.languages && user.languages.length > 0 ? (
            <ul className="compact-list">
              {user.languages.map((lang: LanguageEntry) => (
                <li key={lang.id || lang.languageName}>
                  {lang.languageName} ({lang.proficiency.substring(0, 3)}.
                  {lang.canRead ? 'R' : ''}
                  {lang.canWrite ? 'W' : ''}
                  {lang.canSpeak ? 'S' : ''})
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>
      </div>

      <div className="section">
        <h2>Preferences & Other Details</h2>
        <div className="grid-2-col">
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
