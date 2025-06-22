'use client';

import type { Job, Filters } from '@/types';

export function filterJobs(allJobs: Job[], filters: Filters): Job[] {
  const {
    searchTerm,
    location,
    roleType,
    isRemote,
    recentActivity,
    industry,
    experienceLevel,
    minExperienceYears,
    salaryMin,
    salaryMax,
  } = filters;

  const lowercasedSearchTerm = searchTerm.toLowerCase();

  return allJobs.filter((job) => {
    const searchTermMatch =
      lowercasedSearchTerm === '' ||
      (job.title && job.title.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.company &&
        job.company.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.skills &&
        job.skills.some((skill) =>
          skill.toLowerCase().includes(lowercasedSearchTerm)
        )) ||
      (job.responsibilities &&
        job.responsibilities.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.requirements &&
        job.requirements.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.industry &&
        job.industry.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.department &&
        job.department.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.roleDesignation &&
        job.roleDesignation.toLowerCase().includes(lowercasedSearchTerm)) ||
      (job.educationQualification &&
        job.educationQualification
          .toLowerCase()
          .includes(lowercasedSearchTerm)) ||
      (job.benefits &&
        typeof job.benefits === 'string' &&
        job.benefits.toLowerCase().includes(lowercasedSearchTerm));

    const locationMatch =
      location.toLowerCase() === '' ||
      (job.location &&
        job.location.toLowerCase().includes(location.toLowerCase()));

    const roleTypeMatch =
      roleType === 'all' ||
      (job.type && job.type.toLowerCase() === roleType.toLowerCase());

    const remoteMatch = !isRemote || job.isRemote;

    const industryMatch =
      !industry ||
      (job.industry &&
        job.industry.toLowerCase().includes(industry.toLowerCase()));

    const experienceLevelMatch =
      !experienceLevel ||
      experienceLevel === 'all' ||
      (job.experienceLevel &&
        job.experienceLevel.toLowerCase() === experienceLevel.toLowerCase());

    let recentActivityMatch = true;
    if (recentActivity && recentActivity !== 'any') {
      const dateToCompareStr = job.updatedAt || job.createdAt || job.postedDate;
      const jobDate = new Date(dateToCompareStr as string);
      const now = new Date();
      const cutoffDate = new Date();
      if (recentActivity === '24h') cutoffDate.setDate(now.getDate() - 1);
      else if (recentActivity === '7d') cutoffDate.setDate(now.getDate() - 7);
      else if (recentActivity === '30d') cutoffDate.setDate(now.getDate() - 30);
      recentActivityMatch = jobDate >= cutoffDate;
    }

    const minExpMatch =
      minExperienceYears === undefined ||
      minExperienceYears === null ||
      (job.minExperienceYears !== null &&
        job.minExperienceYears !== undefined &&
        job.minExperienceYears >= minExperienceYears);

    const salaryMinMatch =
      salaryMin === undefined ||
      salaryMin === null ||
      (job.payTransparency !== false &&
        job.salaryMax !== null &&
        job.salaryMax !== undefined &&
        job.salaryMax >= salaryMin);

    const salaryMaxMatch =
      salaryMax === undefined ||
      salaryMax === null ||
      (job.payTransparency !== false &&
        job.salaryMin !== null &&
        job.salaryMin !== undefined &&
        job.salaryMin <= salaryMax);

    const salaryFilterApplied =
      salaryMin !== undefined || salaryMax !== undefined;

    const hasSalaryInfo =
      job.payTransparency !== false &&
      (job.salaryMin !== undefined || job.salaryMax !== undefined);

    const salaryMatch = !salaryFilterApplied || hasSalaryInfo;

    return (
      searchTermMatch &&
      locationMatch &&
      roleTypeMatch &&
      remoteMatch &&
      recentActivityMatch &&
      industryMatch &&
      experienceLevelMatch &&
      minExpMatch &&
      salaryMatch &&
      salaryMinMatch &&
      salaryMaxMatch
    );
  });
}
