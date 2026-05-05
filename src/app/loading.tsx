export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-10 w-10 rounded-full border-4 border-[#1B4332]/20 border-t-[#1B4332] animate-spin" />
        {/* Loading text */}
        <p className="text-sm font-medium text-[#1B4332]">Chargement...</p>
      </div>
    </div>
  );
}
