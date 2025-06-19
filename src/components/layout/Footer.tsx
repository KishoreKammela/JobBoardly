export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} JobBoardly. All rights reserved.
        </p>
        <p className="mt-1">Powered by AI to help you find your dream job.</p>
      </div>
    </footer>
  );
}
