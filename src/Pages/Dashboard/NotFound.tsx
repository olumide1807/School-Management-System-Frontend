import { Link } from "react-router-dom";

// Rendered for any path inside the dashboard layout that no route matches,
// so a missing page reads as missing rather than as a broken blank screen.
// The layout (and its sidebar) stays around it.
export default function DashboardNotFound() {
  return (
    <div className="max-w-[520px] py-12">
      <h1 className="text-xl font-semibold text-secondary">Page not found</h1>
      <p className="mt-2 text-sm text-gray-1 leading-relaxed">
        There&apos;s nothing at this address. The link may be wrong, or the
        page may have moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-5 px-4 py-2 rounded-[8px] text-sm text-white bg-tertiary hover:bg-secondary transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
