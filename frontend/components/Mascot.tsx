export function Mascot({ compact = false, mood = 'idle' }: { compact?: boolean; mood?: 'idle' | 'progress' | 'celebrate' }) {
  return <div className={`mascot mascot-${mood} ${compact ? 'mascot-compact' : ''}`} aria-hidden="true">
    <div className="mascot-spark spark-one" /><div className="mascot-spark spark-two" />
    <div className="mascot-orbit" /><div className="mascot-body"><span className="mascot-eye" /><span className="mascot-eye" /><span className="mascot-smile" /></div>
  </div>;
}
