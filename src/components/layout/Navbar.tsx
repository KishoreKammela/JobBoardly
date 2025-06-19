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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
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

interface NavLinkConfig {
  href: string;
  label: string;
  icon: JSX.Element;
  authRequired: boolean;
  roles: UserRole[]; // Roles for which this link is primary/relevant
  publicAccess?: boolean; // True if accessible without login
  employerOnly?: boolean;
  jobSeekerOnly?: boolean;
  adminOnly?: boolean;
}

// Defines links that can appear in the main horizontal navigation bar
const mainNavLinksConfig: NavLinkConfig[] = [
  {
    href: '/jobs',
    label: 'Find Jobs',
    icon: <Search className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: ['jobSeeker', 'admin', 'superAdmin'],
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: <Columns className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: ['jobSeeker', 'employer', 'admin', 'superAdmin'],
  },
  {
    href: '/employer',
    label: 'For Employers',
    icon: <Building className="h-4 w-4" />,
    authRequired: false,
    publicAccess: true,
    roles: [], // Special handling: show if not logged in, or if jobSeeker
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
    roles: ['admin', 'superAdmin'],
    adminOnly: true,
  },
];

// Defines links that primarily live in the user's account dropdown menu
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
};

export function Navbar() {
  const { user, company, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
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
    return '';
  };

  const isEmployerPage = pathname.startsWith('/employer');
  const loginLink = isEmployerPage ? '/employer/login' : '/auth/login';
  const registerLink = isEmployerPage ? '/employer/register' : '/auth/register';

  const isCompanyActionDisabled =
    company && (company.status === 'suspended' || company.status === 'deleted');

  const getRenderedMainNavLinks = () => {
    if (loading) return [];
    return mainNavLinksConfig.filter((link) => {
      if (!user) {
        // Logged-out user
        if (link.href === '/employer') return !isEmployerPage;
        return link.publicAccess && !link.authRequired;
      }
      // Logged-in user
      if (link.employerOnly && isCompanyActionDisabled) return false; // Hide employer links if company suspended/deleted
      if (link.roles.includes(user.role)) return true;
      if (
        (user.role === 'admin' || user.role === 'superAdmin') &&
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
  const currentAccountDropdownLinks = user
    ? userAccountDropdownLinksConfig[user.role] || []
    : [];

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

        {/* Desktop Main Navigation */}
        <nav className="hidden md:flex items-center gap-2 md:gap-3">
          {renderedMainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5 ${
                link.employerOnly && isCompanyActionDisabled
                  ? 'pointer-events-none opacity-50'
                  : ''
              }`}
              aria-disabled={link.employerOnly && isCompanyActionDisabled}
              onClick={(e) => {
                if (link.employerOnly && isCompanyActionDisabled)
                  e.preventDefault();
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
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
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {currentAccountDropdownLinks.map((item) => {
                  const isDisabled =
                    (item.href.includes('/employer/ai-candidate-match') ||
                      item.href.includes('/profile')) &&
                    isCompanyActionDisabled &&
                    item.href !== '/profile';
                  const isProfileCompanyLinkDisabled =
                    item.href === '/profile' &&
                    user.role === 'employer' &&
                    isCompanyActionDisabled;
                  // Allow access to /profile for personal details even if company is suspended/deleted

                  return (
                    <DropdownMenuItem
                      key={item.href}
                      asChild
                      disabled={isDisabled && !isProfileCompanyLinkDisabled}
                    >
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2 cursor-pointer w-full ${
                          isDisabled && !isProfileCompanyLinkDisabled
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }`}
                        onClick={(e) => {
                          if (isDisabled && !isProfileCompanyLinkDisabled)
                            e.preventDefault();
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}

                <div className="md:hidden">
                  {renderedMainNavLinks.length > 0 && <DropdownMenuSeparator />}
                  {renderedMainNavLinks.length > 0 && (
                    <DropdownMenuLabel className="text-xs text-muted-foreground px-2">
                      Navigation
                    </DropdownMenuLabel>
                  )}
                  {renderedMainNavLinks.map((link) => (
                    <DropdownMenuItem
                      key={`dd-main-${link.href}`}
                      asChild
                      disabled={link.employerOnly && isCompanyActionDisabled}
                    >
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 cursor-pointer w-full ${
                          link.employerOnly && isCompanyActionDisabled
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }`}
                        onClick={(e) => {
                          if (link.employerOnly && isCompanyActionDisabled)
                            e.preventDefault();
                        }}
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
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
