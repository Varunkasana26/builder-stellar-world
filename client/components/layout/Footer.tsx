export function Footer() {
  return (
    <footer className="border-t mt-16">
      <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} FRA Atlas & Decision Support System</p>
        <p>
          Built as an MVP with mock AI/ML for demonstrations. Not for operational
          use.
        </p>
      </div>
    </footer>
  );
}
