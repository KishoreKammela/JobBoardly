import React from 'react';
import type {
  UserProfile,
  ExperienceEntry,
  EducationEntry,
  LanguageEntry,
} from '@/types';
import { formatCurrencyINR } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';

interface PrintableProfileProps {
  user: UserProfile;
}

const MAX_SUMMARY_LENGTH = 800;
const MAX_EXPERIENCE_DESC_LENGTH = 300;
const MAX_EDUCATION_DESC_LENGTH = 250;

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return 'N/A';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const PrintableProfileComponent = React.forwardRef<
  HTMLDivElement,
  PrintableProfileProps
>(({ user }, ref) => {
  if (!user) {
    return (
      <div ref={ref} className="printable-profile-content-wrapper">
        <p>No user data provided for printing.</p>
      </div>
    );
  }

  const totalExperienceString = () => {
    const years = user.totalYearsExperience || 0;
    const months = user.totalMonthsExperience || 0;
    if (years === 0 && months === 0) return null;
    let str = '';
    if (years > 0) str += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (str) str += ', ';
      str += `${months} month${months > 1 ? 's' : ''}`;
    }
    return str;
  };

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
    <div ref={ref} className="printable-profile-content-wrapper">
      <div className="printable-profile-center printable-profile-mb-large">
        <h1 className="printable-profile-h1">{user.name}</h1>
        {user.headline && (
          <p className="printable-profile-subtext">{user.headline}</p>
        )}
        <p className="printable-profile-subtext">
          {user.email && <span>{user.email}</span>}
          {user.mobileNumber && (
            <>
              {user.email && (
                <span className="printable-profile-bullet">&bull;</span>
              )}
              <span>{user.mobileNumber}</span>
            </>
          )}
          {(user.homeCity || user.homeState) && (
            <>
              {(user.email || user.mobileNumber) && (
                <span className="printable-profile-bullet">&bull;</span>
              )}
              <span>
                {user.homeCity}
                {user.homeCity && user.homeState ? ', ' : ''}
                {user.homeState}
              </span>
            </>
          )}
        </p>
        <p className="printable-profile-subtext">
          {user.portfolioUrl && (
            <a
              href={user.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="printable-profile-link"
            >
              Portfolio
            </a>
          )}
          {user.linkedinUrl && (
            <>
              {user.portfolioUrl && (
                <span className="printable-profile-bullet">&bull;</span>
              )}
              <a
                href={user.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="printable-profile-link"
              >
                LinkedIn
              </a>
            </>
          )}
        </p>
      </div>

      {totalExperienceString() && (
        <div className="printable-profile-section">
          <h2 className="printable-profile-h2">Total Experience</h2>
          <p>{totalExperienceString()}</p>
        </div>
      )}

      {user.parsedResumeText && (
        <div className="printable-profile-section">
          <h2 className="printable-profile-h2">Professional Summary</h2>
          <p className="printable-profile-pre-wrap printable-profile-small-text">
            {truncateText(user.parsedResumeText, MAX_SUMMARY_LENGTH)}
          </p>
        </div>
      )}

      {user.experiences && user.experiences.length > 0 && (
        <div className="printable-profile-section">
          <h2 className="printable-profile-h2">Work Experience</h2>
          {user.experiences.map((exp: ExperienceEntry) => (
            <div key={exp.id} className="printable-profile-mb-medium">
              <h3 className="printable-profile-h3">{exp.jobRole}</h3>
              <h4 className="printable-profile-h4">{exp.companyName}</h4>
              <p className="printable-profile-date-text">
                {exp.startDate &&
                isValid(parse(exp.startDate, 'yyyy-MM-dd', new Date()))
                  ? format(
                      parse(exp.startDate, 'yyyy-MM-dd', new Date()),
                      'MMM yyyy'
                    )
                  : 'N/A'}{' '}
                -{' '}
                {exp.currentlyWorking
                  ? 'Present'
                  : exp.endDate &&
                      isValid(parse(exp.endDate, 'yyyy-MM-dd', new Date()))
                    ? format(
                        parse(exp.endDate, 'yyyy-MM-dd', new Date()),
                        'MMM yyyy'
                      )
                    : 'N/A'}
                {exp.annualCTC && ` | CTC: ${formatCurrencyINR(exp.annualCTC)}`}
              </p>
              {exp.description && (
                <p className="printable-profile-pre-wrap printable-profile-small-text">
                  {truncateText(exp.description, MAX_EXPERIENCE_DESC_LENGTH)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {user.educations && user.educations.length > 0 && (
        <div className="printable-profile-section">
          <h2 className="printable-profile-h2">Education</h2>
          {user.educations.map((edu: EducationEntry) => (
            <div key={edu.id} className="printable-profile-mb-medium">
              <h3 className="printable-profile-h3">
                {edu.degreeName}
                {edu.specialization && `, ${edu.specialization}`}
                {edu.isMostRelevant && (
                  <span className="printable-profile-relevant-tag">
                    (Relevant)
                  </span>
                )}
              </h3>
              <h4 className="printable-profile-h4">
                {edu.instituteName} ({edu.level})
              </h4>
              <p className="printable-profile-date-text">
                {edu.startYear && edu.endYear
                  ? `${edu.startYear} - ${edu.endYear}`
                  : edu.endYear || 'N/A'}
                {edu.courseType && ` | ${edu.courseType}`}
              </p>
              {edu.description && (
                <p className="printable-profile-pre-wrap printable-profile-small-text">
                  {truncateText(edu.description, MAX_EDUCATION_DESC_LENGTH)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="printable-profile-grid-cols-2">
        <div>
          <h2 className="printable-profile-h2">Skills</h2>
          {user.skills && user.skills.length > 0 ? (
            <ul className="printable-profile-list-none printable-profile-flex-wrap">
              {user.skills.map((skill, index) => (
                <li
                  key={`skill-${index}`}
                  className="printable-profile-skill-badge"
                >
                  {skill}
                </li>
              ))}
            </ul>
          ) : (
            <p>N/A</p>
          )}
        </div>
        <div>
          <h2 className="printable-profile-h2">Languages</h2>
          {user.languages && user.languages.length > 0 ? (
            <ul className="printable-profile-list-none printable-profile-flex-wrap">
              {user.languages.map((lang: LanguageEntry) => (
                <li
                  key={lang.id || lang.languageName}
                  className="printable-profile-skill-badge"
                >
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

      <div className="printable-profile-section">
        <h2 className="printable-profile-h2">Other Details</h2>
        <div className="printable-profile-mb-medium">
          <h3 className="printable-profile-h3-small">Personal</h3>
          <div className="printable-profile-grid-cols-2">
            {user.dateOfBirth &&
              isValid(parse(user.dateOfBirth, 'yyyy-MM-dd', new Date())) && (
                <p className="printable-profile-detail-item">
                  <strong>Date of Birth:</strong>{' '}
                  {format(
                    parse(user.dateOfBirth, 'yyyy-MM-dd', new Date()),
                    'PP'
                  )}
                </p>
              )}
            {user.gender && user.gender !== 'Prefer not to say' && (
              <p className="printable-profile-detail-item">
                <strong>Gender:</strong> {user.gender}
              </p>
            )}
          </div>
        </div>

        <div className="printable-profile-mb-medium">
          <h3 className="printable-profile-h3-small">Compensation</h3>
          <div className="printable-profile-grid-cols-2">
            {user.currentCTCValue !== undefined && (
              <p className="printable-profile-detail-item">
                <strong>Current CTC:</strong>{' '}
                {user.currentCTCConfidential
                  ? 'Confidential'
                  : `${formatCurrencyINR(user.currentCTCValue)}/year`}
              </p>
            )}
            {user.expectedCTCValue !== undefined && (
              <p className="printable-profile-detail-item">
                <strong>Expected CTC:</strong>{' '}
                {formatCurrencyINR(user.expectedCTCValue)}/year{' '}
                {user.expectedCTCNegotiable && '(Negotiable)'}
              </p>
            )}
            {user.currentCTCValue === undefined &&
              user.expectedCTCValue === undefined && (
                <p className="printable-profile-detail-item">Not specified.</p>
              )}
          </div>
        </div>

        <div className="printable-profile-mb-medium">
          <h3 className="printable-profile-h3-small">Preferences</h3>
          <div className="printable-profile-grid-cols-2">
            {user.preferredLocations && user.preferredLocations.length > 0 && (
              <p className="printable-profile-detail-item">
                <strong>Preferred Locations:</strong>{' '}
                {user.preferredLocations.join(', ')}
              </p>
            )}
            {user.availability && (
              <p className="printable-profile-detail-item">
                <strong>Availability:</strong> {user.availability}
              </p>
            )}
            {user.jobSearchStatus && (
              <p className="printable-profile-detail-item">
                <strong>Job Search Status:</strong>{' '}
                {user.jobSearchStatus
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </p>
            )}
            {(!user.preferredLocations ||
              user.preferredLocations.length === 0) &&
              !user.jobSearchStatus &&
              !user.availability && (
                <p className="printable-profile-detail-item">Not specified.</p>
              )}
          </div>
        </div>
      </div>

      {hasTruncatedContent && (
        <div className="printable-profile-truncate-note">
          Note: Some detailed descriptions may have been truncated for brevity.
          For the full profile, please view online if available.
        </div>
      )}
    </div>
  );
});

PrintableProfileComponent.displayName = 'PrintableProfileComponent';
export { PrintableProfileComponent };
