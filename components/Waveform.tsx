export function Waveform({
  active,
  speaking = false
}: {
  active: boolean;
  speaking?: boolean;
}) {
  return (
    <div
      className={`waveform ${active ? "active" : ""} ${
        speaking ? "speaking" : ""
      }`}
      aria-label={
        active ? (speaking ? "Assistant speaking" : "Listening") : "Microphone off"
      }
    >
      {Array.from({ length: 11 }).map((_, index) => (
        <span key={index} style={{ animationDelay: `${index * 60}ms` }} />
      ))}
    </div>
  );
}