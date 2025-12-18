export default function Loader(space: boolean = true) {
  return (
    <div className={`flex items-center justify-center${space ? ' min-h-screen' : ''}`}>
      <div className="w-12 h-12 border-4 border-dashed border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}