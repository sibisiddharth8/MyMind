/**
 * A simple, clean loading spinner for the entire page.
 */
export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-dashed border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}