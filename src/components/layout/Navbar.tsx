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
} from 'lucide-react'; // Added Menu
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

interface NavLinkConfig {
  href: string;
  label: string;
  icon: JSX.Element;
  authRequired: boolean;
  roles: UserRole[];
  alwaysShowForSeekerOrPublic?: boolean;
  visibility: 'primary' | 'secondary'; // 'primary' = always in bar, 'secondary' = bar on lg+, dropdown always
}

const navLinksBase: NavLinkConfig[] = [
  {
    href: '/jobs',
    label: 'Find Jobs',
    icon: <Search className="h-4 w-4" />,
    authRequired: false,
    roles: ['jobSeeker', 'admin'],
    alwaysShowForSeekerOrPublic: true,
    visibility: 'primary',
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: <Columns className="h-4 w-4" />,
    authRequired: false,
    roles: ['jobSeeker', 'employer', 'admin'],
    alwaysShowForSeekerOrPublic: true,
    visibility: 'primary',
  },
  {
    href: '/employer/find-candidates',
    label: 'Find Candidates',
    icon: <Users className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    visibility: 'primary',
  },
  {
    href: '/ai-match',
    label: 'AI Job Matcher',
    icon: <Brain className="h-4 w-4" />,
    authRequired: true,
    roles: ['jobSeeker'],
    visibility: 'secondary',
  },
  {
    href: '/employer/ai-candidate-match',
    label: 'AI Candidate Matcher',
    icon: <Lightbulb className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    visibility: 'secondary',
  },
  {
    href: '/employer/post-job',
    label: 'Post Job',
    icon: <FilePlus className="h-4 w-4" />,
    authRequired: true,
    roles: ['employer'],
    visibility: 'primary',
  },
  {
    href: '/admin',
    label: 'Admin Panel',
    icon: <Shield className="h-4 w-4" />,
    authRequired: true,
    roles: ['admin'],
    visibility: 'primary',
  },
];

const userAccountDropdownLinks = {
  // Renamed for clarity
  jobSeeker: [
    { href: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    {
      href: '/my-jobs',
      label: 'My Jobs',
      icon: <FolderKanban className="h-4 w-4" />,
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
      href: '/employer/posted-jobs',
      label: 'Posted Jobs',
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  admin: [
    { href: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    {
      href: '/admin',
      label: 'Admin Dashboard',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />,
    },
  ],
};

export function Navbar() {
  const { user, logout, loading } = useAuth();
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
    return '';
  };

  const isEmployerPage = pathname.startsWith('/employer');
  const loginLink = isEmployerPage ? '/employer/login' : '/auth/login';
  const registerLink = isEmployerPage ? '/employer/register' : '/auth/register';

  const getRelevantNavLinks = () => {
    if (loading) return [];
    return navLinksBase.filter((link) => {
      if (user) {
        // Logged in
        if (link.roles.includes(user.role)) return true;
        // Allow admin to see seeker-specific "Find Jobs" and public "Companies" - these specific overrides might be redundant if roles array is comprehensive
        if (
          user.role === 'admin' &&
          link.alwaysShowForSeekerOrPublic &&
          (link.href === '/jobs' || link.href === '/companies')
        )
          return true;
        // Allow employer to see public "Companies" - this specific override might be redundant
        if (
          user.role === 'employer' &&
          link.href === '/companies' &&
          link.alwaysShowForSeekerOrPublic
        )
          return true;

        return false;
      } else {
        // Not logged in
        return !link.authRequired && link.alwaysShowForSeekerOrPublic;
      }
    });
  };

  const relevantNavLinks = getRelevantNavLinks();

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

        {/* Main navigation links for larger screens */}
        <nav className="hidden md:flex items-center gap-2 md:gap-3">
          {relevantNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium text-foreground/80 hover:text-primary transition-colors items-center gap-1.5 
                            ${link.visibility === 'primary' ? 'flex' : 'hidden lg:flex'}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
          {!user && !loading && !isEmployerPage && (
            <Link
              href="/employer"
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5"
            >
              <Building className="h-4 w-4" />
              <span>For Employers</span>
            </Link>
          )}
        </nav>

        {/* Auth buttons or User Profile Dropdown */}
        <div className="flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
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
                {' '}
                {/* Increased width for nav links */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email} ({getRoleDisplayName(user.role)})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(userAccountDropdownLinks[user.role] || []).map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 cursor-pointer w-full"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {/* Additional Navigation Links for all screen sizes, including those hidden on small main nav */}
                {relevantNavLinks.length > 0 && <DropdownMenuSeparator />}
                {relevantNavLinks.length > 0 && (
                  <DropdownMenuLabel className="text-xs text-muted-foreground px-2">
                    Quick Navigation
                  </DropdownMenuLabel>
                )}
                {relevantNavLinks.map((link) => (
                  <DropdownMenuItem key={`dd-${link.href}`} asChild>
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
            // Unauthenticated user: Auth buttons + mobile menu trigger
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
              {/* Mobile Menu Trigger for Unauthenticated or when main nav is too crowded */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {relevantNavLinks.map((link) => (
                      <DropdownMenuItem key={`mobile-${link.href}`} asChild>
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    {!user && !loading && !isEmployerPage && (
                      <DropdownMenuItem asChild>
                        <Link
                          href="/employer"
                          className="flex items-center gap-2 cursor-pointer w-full"
                        >
                          <Building className="h-4 w-4" /> For Employers
                        </Link>
                      </DropdownMenuItem>
                    )}
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
