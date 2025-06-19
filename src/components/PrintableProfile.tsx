import React from 'react';
import type { UserProfile } from '@/types';
import { formatCurrencyINR } from '@/lib/utils';

interface PrintableProfileProps {
  user: UserProfile;
}

const MAX_TEXT_LENGTH = 750;
const MAX_SUB_TEXT_LENGTH = 250;

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
    (user.experience && user.experience.length > MAX_TEXT_LENGTH) ||
    (user.education && user.education.length > MAX_TEXT_LENGTH) ||
    (user.parsedResumeText && user.parsedResumeText.length > MAX_TEXT_LENGTH);

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
            font-size: 10pt;
            line-height: 1.3;
            color: #333 !important;
          }
          .printable-profile h1,
          .printable-profile h2,
          .printable-profile h3 {
            color: #111 !important;
          }
          .printable-profile strong {
            font-weight: 600;
          }
          .printable-profile a {
            color: #007bff !important;
            text-decoration: none;
          }
          .printable-profile hr {
            border-top: 1px solid #ccc;
            margin: 1rem 0;
          }
          .printable-profile ul {
            margin-left: 1.5rem;
            list-style-type: disc;
          }
          .printable-profile .section {
            margin-bottom: 1rem;
            page-break-inside: avoid;
          }
          .printable-profile .header {
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .printable-profile .header h1 {
            font-size: 1.8rem;
            margin-bottom: 0.25rem;
          }
          .printable-profile .header p {
            margin: 0.1rem 0;
            font-size: 0.9rem;
          }
          .printable-profile .skills-list,
          .languages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-top: 0.5rem;
          }
          .printable-profile .skill-badge,
          .language-badge {
            background-color: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.8rem;
          }
          .printable-profile .experience-item,
          .printable-profile .education-item {
            margin-bottom: 0.75rem;
            page-break-inside: avoid;
          }
          .printable-profile .item-title {
            font-weight: bold;
            font-size: 1rem;
          }
          .printable-profile .item-subtitle {
            font-size: 0.9rem;
            color: #555 !important;
            margin-bottom: 0.25rem;
          }
          .printable-profile .item-description {
            white-space: pre-wrap;
            font-size: 0.9rem;
          }
          .printable-profile .footer-note {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: #777 !important;
            text-align: center;
          }
        }
        .printable-profile {
          font-family: 'Inter', sans-serif;
          max-width: 800px;
          margin: auto;
        }
        .printable-profile h1 {
          font-size: 2rem;
        }
        .printable-profile h2 {
          font-size: 1.5rem;
          margin-top: 1.5rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 0.3rem;
        }
        .printable-profile h3 {
          font-size: 1.2rem;
        }
        .printable-profile .section {
          margin-bottom: 1.5rem;
        }
        .printable-profile .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .printable-profile .header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.25rem;
          color: #007bff;
        }
        .printable-profile .header p {
          margin: 0.2rem 0;
          font-size: 1rem;
          color: #495057;
        }
        .printable-profile .skills-list,
        .languages-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .printable-profile .skill-badge,
        .language-badge {
          background-color: #007bff;
          color: white;
          padding: 0.3rem 0.6rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
        }
        .printable-profile .experience-item,
        .printable-profile .education-item {
          margin-bottom: 1rem;
        }
        .printable-profile .item-title {
          font-weight: bold;
          font-size: 1.1rem;
          color: #343a40;
        }
        .printable-profile .item-subtitle {
          font-size: 1rem;
          color: #6c757d;
          margin-bottom: 0.25rem;
        }
        .printable-profile .item-description {
          white-space: pre-wrap;
          font-size: 1rem;
          color: #495057;
          margin-left: 1rem;
          padding-left: 1rem;
          border-left: 2px solid #007bff30;
        }
        .printable-profile .footer-note {
          margin-top: 2rem;
          font-size: 0.8rem;
          color: #777;
          text-align: center;
        }
      `}</style>

      <div className="header">
        <h1>{user.name}</h1>
        {user.headline && <p>{user.headline}</p>}
        <p>
          {user.email && <span>{user.email}</span>}
          {user.mobileNumber && (
            <>
              {' '}
              | <span>{user.mobileNumber}</span>
            </>
          )}
        </p>
        <p>
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
              {' '}
              |{' '}
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
          <h2>Summary / Parsed Resume</h2>
          <p className="item-description">
            {truncateText(user.parsedResumeText, MAX_TEXT_LENGTH)}
          </p>
        </div>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="section">
          <h2>Skills</h2>
          <div className="skills-list">
            {user.skills.map((skill, index) => (
              <span key={`${skill}-${index}`} className="skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.languages && user.languages.length > 0 && (
        <div className="section">
          <h2>Languages</h2>
          <div className="languages-list">
            {user.languages.map((lang, index) => (
              <span key={`${lang}-${index}`} className="language-badge">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.experience && (
        <div className="section">
          <h2>Work Experience</h2>
          {user.experience.split(/\n###\s|\n##\s/).map((expSection, index) => {
            if (
              index === 0 &&
              !user.experience.startsWith('###') &&
              !user.experience.startsWith('##')
            ) {
              return (
                <p key={`exp-desc-${index}`} className="item-description">
                  {truncateText(expSection, MAX_TEXT_LENGTH)}
                </p>
              );
            }
            if (!expSection.trim()) return null;
            const lines = expSection.trim().split('\n');
            const titleLine = lines[0] || '';
            const description = lines.slice(1).join('\n');
            return (
              <div key={`exp-${index}`} className="experience-item">
                <h3 className="item-title">
                  {titleLine.replace(/###\s|##\s/, '')}
                </h3>
                <p className="item-description">
                  {truncateText(description, MAX_SUB_TEXT_LENGTH)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {user.education && (
        <div className="section">
          <h2>Education</h2>
          {user.education.split(/\n###\s|\n##\s/).map((eduSection, index) => {
            if (
              index === 0 &&
              !user.education.startsWith('###') &&
              !user.education.startsWith('##')
            ) {
              return (
                <p key={`edu-desc-${index}`} className="item-description">
                  {truncateText(eduSection, MAX_TEXT_LENGTH)}
                </p>
              );
            }
            if (!eduSection.trim()) return null;
            const lines = eduSection.trim().split('\n');
            const titleLine = lines[0] || '';
            const description = lines.slice(1).join('\n');
            return (
              <div key={`edu-${index}`} className="education-item">
                <h3 className="item-title">
                  {titleLine.replace(/###\s|##\s/, '')}
                </h3>
                <p className="item-description">
                  {truncateText(description, MAX_SUB_TEXT_LENGTH)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="section">
        <h2>Additional Information</h2>
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
        {user.desiredSalary !== undefined && (
          <p>
            <strong>Desired Salary:</strong>{' '}
            {formatCurrencyINR(user.desiredSalary)} per annum
          </p>
        )}
      </div>

      {hasTruncatedContent && (
        <div className="footer-note">
          Note: Some content may have been truncated for brevity. For the full
          profile, please view online.
        </div>
      )}
    </div>
  );
});

PrintableProfileComponent.displayName = 'PrintableProfileComponent';
export { PrintableProfileComponent };
