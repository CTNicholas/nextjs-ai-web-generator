export function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src="https://liveblocks.io/loading.svg"
        alt="Loading"
        className="opacity-20 size-16"
      />
    </div>
  );
}
