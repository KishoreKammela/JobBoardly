
"use client";
import Link from 'next/link';
import { Briefcase, Brain, User, Settings, LogIn, UserPlus, Building, FilePlus, Search, ListChecks, Users, History, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from 'next/navigation'; 
import type { UserRole } from '@/types'; 

const navLinksBase = [
  { href: '/jobs', label: 'Find Jobs', icon: <Search className="h-4 w-4" />, authRequired: false, roles: ['jobSeeker', 'admin'], alwaysShowForSeekerOrPublic: true },
  { href: '/employer/find-candidates', label: 'Find Candidates', icon: <Users className="h-4 w-4" />, authRequired: true, roles: ['employer'] },
  { href: '/ai-match', label: 'AI Matcher', icon: <Brain className="h-4 w-4" />, authRequired: true, roles: ['jobSeeker'] },
  { href: '/employer/post-job', label: 'Post Job', icon: <FilePlus className="h-4 w-4" />, authRequired: true, roles: ['employer'] },
  { href: '/admin', label: 'Admin Panel', icon: <Shield className="h-4 w-4" />, authRequired: true, roles: ['admin'] },
];

const userDropdownLinks = {
  jobSeeker: [
    { href: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { href: '/applied-jobs', label: 'Applied Jobs', icon: <History className="h-4 w-4" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  employer: [
    { href: '/profile', label: 'Company Profile', icon: <Building className="h-4 w-4" /> },
    { href: '/employer/posted-jobs', label: 'Posted Jobs', icon: <ListChecks className="h-4 w-4" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ],
  admin: [ 
    { href: '/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
    { href: '/admin', label: 'Admin Dashboard', icon: <Shield className="h-4 w-4" /> },
    { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ]
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
    return user.name ? user.name.substring(0, user.role === 'employer' ? 2 : 1).toUpperCase() : (user.email ? user.email.substring(0,1).toUpperCase() : 'U');
  }

  const getRoleDisplayName = (role?: UserRole) => {
    if (!role) return "";
    if (role === 'jobSeeker') return "Job Seeker";
    if (role === 'employer') return "Employer";
    if (role === 'admin') return "Admin";
    return "";
  }

  const isEmployerPage = pathname.startsWith('/employer');
  const loginLink = isEmployerPage ? "/employer/login" : "/auth/login";
  const registerLink = isEmployerPage ? "/employer/register" : "/auth/register";

  const getVisibleNavLinks = () => {
    if (loading) return []; // Don't show role-specific links while loading auth state
    if (user) {
      return navLinksBase.filter(link => link.roles.includes(user.role) && link.authRequired);
    }
    // For logged-out users, show only non-authRequired links targeted at job seekers or public
    return navLinksBase.filter(link => !link.authRequired && link.alwaysShowForSeekerOrPublic);
  };
  const visibleNavLinks = getVisibleNavLinks();


  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <Briefcase className="h-7 w-7" />
          <h1 className="text-2xl font-bold font-headline">JobBoardly</h1>
        </Link>
        <nav className="flex items-center gap-3 md:gap-4">
          {visibleNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
          ))}
           {!user && !loading && !isEmployerPage && (
             <Link href="/employer" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">For Employers</span>
              </Link>
           )}

          {loading ? (
             <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png?text=${getAvatarFallback()}`} alt={user.name || "User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email} ({getRoleDisplayName(user.role)})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(userDropdownLinks[user.role] || []).map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                      {link.icon}
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 flex items-center gap-2">
                  <LogIn className="h-4 w-4 rotate-180" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
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
          )}
        </nav>
      </div>
    </header>
  );
}
