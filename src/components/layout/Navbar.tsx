
"use client";
import Link from 'next/link';
import { Briefcase, Brain, User, Settings, LogIn, UserPlus, Building, FilePlus, Search, ListChecks, Users, History } from 'lucide-react';
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
import { useRouter } from 'next/navigation';

const navLinks = [
  { href: '/jobs', label: 'Find Jobs', icon: <Search className="h-4 w-4" />, authRequired: false, roles: ['jobSeeker', 'employer'], alwaysShow: true }, // 'alwaysShow' means show even if no specific role matches (e.g. for non-logged in)
  { href: '/ai-match', label: 'AI Matcher', icon: <Brain className="h-4 w-4" />, authRequired: true, roles: ['jobSeeker'] },
  { href: '/employer/post-job', label: 'Post Job', icon: <FilePlus className="h-4 w-4" />, authRequired: true, roles: ['employer'] },
  { href: '/employer/find-candidates', label: 'Find Candidates', icon: <Users className="h-4 w-4" />, authRequired: true, roles: ['employer'] },
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
  ]
};

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const getAvatarFallback = () => {
    if (!user) return 'U';
    if (user.role === 'employer' && user.name) return user.name.substring(0,2).toUpperCase();
    return user.name?.[0]?.toUpperCase() || 'U';
  }

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
          <Briefcase className="h-7 w-7" />
          <h1 className="text-2xl font-bold font-headline">JobBoardly</h1>
        </Link>
        <nav className="flex items-center gap-3 md:gap-4">
          {navLinks.map((link) => {
            const showLink = 
              (link.alwaysShow && !user) || // Show if alwaysShow and not logged in
              (user && link.roles.includes(user.role)) || // Show if logged in and role matches
              (!link.authRequired && !user); // Show if no auth required and not logged in (covered by alwaysShow more explicitly)
            
            // Refined logic: If it's for 'employer' and user is not an employer, don't show, unless it's an alwaysShow link for all.
            // If it's for 'jobSeeker' and user is not a jobSeeker, don't show.
            // The 'Find Jobs' link should be visible to all, hence 'alwaysShow' and checking roles too.
            let display = false;
            if (link.alwaysShow) display = true;
            if (user && link.roles.includes(user.role)) display = true;
            if (!link.authRequired && !user && link.roles.includes('jobSeeker') && link.href === '/jobs') display = true; // Specifically for Find Jobs for anonymous users.


            if (link.href === '/jobs') { // "Find Jobs" is always visible
                 display = true;
            } else if (user) { // For logged-in users
                if (link.roles.includes(user.role)) {
                    display = true;
                }
            } else { // For non-logged-in users
                if (!link.authRequired && (link.href !== '/employer/find-candidates' && link.href !== '/employer/post-job' && link.href !== '/ai-match')) {
                     //display = true; // Show non-auth required links like employer landing page
                }
            }


            return display && (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            )
          })}
           {!user && (
             <Link href="/employer" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1.5">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">For Employers</span>
              </Link>
           )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl || `https://placehold.co/40x40.png`} alt={user.name || "User"} data-ai-hint="user avatar" />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email} ({user.role === 'jobSeeker' ? "Job Seeker" : "Employer"})
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
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-1.5" /> Login
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/register">
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
