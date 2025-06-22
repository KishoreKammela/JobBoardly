// src/components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import {
  Briefcase,
  Brain,
  User,
  Settings,
  LogIn,
  UserPlus,
  Building,
  FilePlus,
  Search,
  ListChecks,
  Users,
  Loader2,
  Shield,
  Lightbulb,
  FolderKanban,
  Columns,
  Menu,
  KeyRound,
  Eye,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/Auth/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter, usePathname } from 'next/navigation';
import type { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { NotificationBell } from './NotificationBell';
import { useToast } from '@/hooks/use-toast';

interface NavLinkConfig {
  href: string;
  label: string;
  icon: JSX.Element;
  authRequired: boolean;
  roles: UserRole[];
  publicAccess?: boolean;
  employerOnly?: boolean;
  jobSeekerOnly?: boolean;
  adminOnly?: boolean; // Includes admin, superAdmin, moderator, supportAgent, dataAnalyst
}

const ADMIN_LIKE_ROLES: UserRole[] = [
  'admin',
  'superAdmin',
  'moderator',
  'supportAgent',
  'dataAnalyst',
  'complianceOfficer',
  'systemMonitor',
];

const mainNavLinksConfig: NavLinkConfig[] = [
  {
    href: '/jobs',
    label: 'Find Jobs',
    icon: <Search className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: ['jobSeeker', ...ADMIN_LIKE_ROLES],
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: <Columns className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: ['jobSeeker', 'employer', ...ADMIN_LIKE_ROLES],
  },
  {
    href: '/employer',
    label: 'For Employers',
    icon: <Building className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: [],
  },
  {
    href: '/my-jobs',
    label: 'My Jobs',
    icon: <FolderKanban className="h-4 w-4" />,
    authRequired: true,
    roles: ['jobSeeker'],
    jobSeekerOnly: true,
  },
  {
    href: '/employer/find-candidates',
    label: 'Find Candidates',
    icon: <Users className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    employerOnly: true,
  },
  {
    href: '/employer/post-job',
    label: 'Post Job',
    icon: <FilePlus className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    employerOnly: true,
  },
  {
    href: '/employer/posted-jobs',
    label: 'My Postings',
    icon: <ListChecks className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    employerOnly: true,
  },
  {
    href: '/admin',
    label: 'Admin Panel',
    icon: <Shield className="h-4 w-4" />,
    authRequired: true,
    roles: ADMIN_LIKE_ROLES,
    adminOnly: true,
  },
];

const userAccountDropdownLinksConfig = {
  jobSeeker: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/profile/preview',
      label: 'Preview Profile',
      icon: <Eye className="h-4 w-4" />,
    },
    {
      href: '/ai-match',
      label: 'AI Job Matcher',
      icon: <Brain className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  employer: [
    {
      href: '/profile',
      label: 'My Profile / Company',
      icon: <Building className="h-4 w-4" />,
    },
    {
      href: '/employer/profile/preview',
      label: 'Preview Company Profile',
      icon: <Eye className="h-4 w-4" />,
    },
    {
      href: '/employer/ai-candidate-match',
      label: 'AI Candidate Matcher',
      icon: <Lightbulb className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  admin: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  superAdmin: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  moderator: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  supportAgent: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  dataAnalyst: [
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  complianceOfficer: [
    // Placeholder, same as others for now
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  systemMonitor: [
    // Placeholder, same as others for now
    {
      href: '/profile',
      label: 'My Profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      href: '/auth/change-password',
      label: 'Change Password',
      icon: <KeyRound className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
};

export function Navbar() {
  const { user, company, logout, loading, pendingJobsCount } = useAuth(); // Added pendingJobsCount
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getAvatarFallback = () => {
    if (!user) return 'U';
    if (user.role === 'employer' && user.companyId && !user.avatarUrl) {
      return user.name ? user.name.substring(0, 1).toUpperCase() : 'E';
    }
    return user.name
      ? user.name.substring(0, 1).toUpperCase()
      : user.email
        ? user.email.substring(0, 1).toUpperCase()
        : 'U';
  };

  const getRoleDisplayName = (role?: UserRole) => {
    if (!role) return '';
    if (role === 'jobSeeker') return 'Job Seeker';
    if (role === 'employer')
      return user?.isCompanyAdmin ? 'Company Admin' : 'Recruiter';
    if (role === 'admin') return 'Platform Admin';
    if (role === 'superAdmin') return 'Super Admin';
    if (role === 'moderator') return 'Moderator';
    if (role === 'supportAgent') return 'Support Agent';
    if (role === 'dataAnalyst') return 'Data Analyst';
    if (role === 'complianceOfficer') return 'Compliance Officer';
    if (role === 'systemMonitor') return 'System Monitor';
    return '';
  };

  const isEmployerPage = pathname.startsWith('/employer');
  const loginLink = isEmployerPage ? '/employer/login' : '/auth/login';
  const registerLink = isEmployerPage ? '/employer/register' : '/auth/register';

  const isCompanyActionDisabled =
    company && (company.status === 'suspended' || company.status === 'deleted');
  const isJobSeekerSuspended =
    user?.role === 'jobSeeker' && user.status === 'suspended';

  const getRenderedMainNavLinks = () => {
    if (loading) return [];
    return mainNavLinksConfig.filter((link) => {
      if (!user) {
        if (link.href === '/employer') return !isEmployerPage;
        return link.publicAccess && !link.authRequired;
      }
      if (link.employerOnly && isCompanyActionDisabled) return false;
      if (
        link.jobSeekerOnly &&
        isJobSeekerSuspended &&
        !['/my-jobs', '/settings', '/profile'].includes(link.href)
      )
        return false;

      if (user.role && link.roles.includes(user.role)) return true;
      if (
        user.role &&
        ADMIN_LIKE_ROLES.includes(user.role) &&
        link.publicAccess &&
        (link.href === '/jobs' || link.href === '/companies')
      ) {
        return true;
      }
      if (
        user.role === 'employer' &&
        link.publicAccess &&
        link.href === '/companies'
      ) {
        return true;
      }

      return false;
    });
  };

  const renderedMainNavLinks = getRenderedMainNavLinks();
  const currentAccountDropdownLinks =
    user && user.role ? userAccountDropdownLinksConfig[user.role] || [] : [];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
        >
          <Briefcase className="h-7 w-7" />
          <h1 className="text-2xl font-bold font-headline">JobBoardly</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-2 md:gap-3">
          {renderedMainNavLinks.map((link) => {
            const isDisabledByStatus =
              (link.employerOnly && isCompanyActionDisabled) ||
              (link.jobSeekerOnly &&
                isJobSeekerSuspended &&
                !['/my-jobs', '/settings', '/profile'].includes(link.href));

            const savedJobsCount =
              user?.role === 'jobSeeker' && link.href === '/my-jobs'
                ? user.savedJobIds?.length || 0
                : 0;

            const displayPendingJobsCount =
              user?.role === 'employer' &&
              link.href === '/employer/posted-jobs' &&
              pendingJobsCount > 0;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5 ${
                  isDisabledByStatus ? 'pointer-events-none opacity-50' : ''
                }`}
                aria-disabled={isDisabledByStatus}
                onClick={(e) => {
                  if (isDisabledByStatus) e.preventDefault();
                }}
              >
                {link.icon}
                <span>{link.label}</span>
                {savedJobsCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-xs ml-0.5"
                  >
                    {savedJobsCount}
                  </Badge>
                )}
                {displayPendingJobsCount && (
                  <Badge
                    variant="default" // Or another appropriate variant
                    className="h-5 px-1.5 text-xs ml-0.5 bg-primary/80 text-primary-foreground"
                  >
                    {pendingJobsCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="User account menu"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={
                          user.avatarUrl ||
                          `https://placehold.co/40x40.png?text=${getAvatarFallback()}`
                        }
                        alt={user.name || 'User'}
                        data-ai-hint="user avatar"
                      />
                      <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email} ({getRoleDisplayName(user.role)})
                      </p>
                      {user.role === 'employer' &&
                        company &&
                        (company.status === 'suspended' ||
                          company.status === 'deleted') && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Company {company.status}
                          </Badge>
                        )}
                      {user.role === 'jobSeeker' &&
                        user.status === 'suspended' && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            <Ban className="h-3 w-3 mr-1" />
                            Account Suspended
                          </Badge>
                        )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {currentAccountDropdownLinks.map((item) => {
                    let isLinkDisabled = false;
                    if (user.role === 'employer') {
                      isLinkDisabled =
                        isCompanyActionDisabled &&
                        (item.href.includes('/employer/ai-candidate-match') ||
                          item.href.includes('/employer/profile/preview') ||
                          (item.href === '/profile' &&
                            user.isCompanyAdmin &&
                            (company?.status === 'suspended' ||
                              company?.status === 'deleted')));
                    } else if (user.role === 'jobSeeker') {
                      isLinkDisabled =
                        isJobSeekerSuspended &&
                        (item.href === '/ai-match' ||
                          item.href === '/profile/preview');
                    }

                    return (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        disabled={isLinkDisabled}
                      >
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 cursor-pointer w-full ${
                            isLinkDisabled
                              ? 'pointer-events-none opacity-50'
                              : ''
                          }`}
                          onClick={(e) => {
                            if (isLinkDisabled) e.preventDefault();
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}

                  <div className="md:hidden">
                    {renderedMainNavLinks.length > 0 && (
                      <DropdownMenuSeparator />
                    )}
                    {renderedMainNavLinks.length > 0 && (
                      <DropdownMenuLabel className="text-xs text-muted-foreground px-2">
                        Navigation
                      </DropdownMenuLabel>
                    )}
                    {renderedMainNavLinks.map((link) => {
                      const isDisabledByStatus =
                        (link.employerOnly && isCompanyActionDisabled) ||
                        (link.jobSeekerOnly &&
                          isJobSeekerSuspended &&
                          !['/my-jobs', '/settings', '/profile'].includes(
                            link.href
                          ));

                      const savedJobsCount =
                        user?.role === 'jobSeeker' && link.href === '/my-jobs'
                          ? user.savedJobIds?.length || 0
                          : 0;

                      const displayPendingJobsCountInDropdown =
                        user?.role === 'employer' &&
                        link.href === '/employer/posted-jobs' &&
                        pendingJobsCount > 0;

                      return (
                        <DropdownMenuItem
                          key={`dd-main-${link.href}`}
                          asChild
                          disabled={isDisabledByStatus}
                        >
                          <Link
                            href={link.href}
                            className={`flex items-center gap-2 cursor-pointer w-full ${
                              isDisabledByStatus
                                ? 'pointer-events-none opacity-50'
                                : ''
                            }`}
                            onClick={(e) => {
                              if (isDisabledByStatus) e.preventDefault();
                            }}
                          >
                            {link.icon}
                            <span>{link.label}</span>
                            {savedJobsCount > 0 && (
                              <Badge
                                variant="secondary"
                                className="h-5 px-1.5 text-xs ml-auto"
                              >
                                {savedJobsCount}
                              </Badge>
                            )}
                            {displayPendingJobsCountInDropdown && (
                              <Badge
                                variant="default"
                                className="h-5 px-1.5 text-xs ml-auto bg-primary/80 text-primary-foreground"
                              >
                                {pendingJobsCount}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2 w-full"
                  >
                    <LogIn className="h-4 w-4 rotate-180" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild size="sm">
                  <Link href={loginLink}>
                    <LogIn className="h-4 w-4 mr-1.5" /> Login
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={registerLink}>
                    <UserPlus className="h-4 w-4 mr-1.5" /> Sign Up
                  </Link>
                </Button>
              </div>
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open menu">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {renderedMainNavLinks.map((link) => (
                      <DropdownMenuItem
                        key={`mobile-main-${link.href}`}
                        asChild
                      >
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={loginLink}
                        className="flex items-center gap-2 cursor-pointer w-full"
                      >
                        <LogIn className="h-4 w-4" /> Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href={registerLink}
                        className="flex items-center gap-2 cursor-pointer w-full"
                      >
                        <UserPlus className="h-4 w-4" /> Sign Up
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
