import { useState } from 'react'
import EventList from './EventList'
import EventDetail from './EventDetail'

function App() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <h1>Kulto</h1>
      {selectedEventId ? (
        <EventDetail eventId={selectedEventId} onBack={() => setSelectedEventId(null)} />
      ) : (
        <EventList onSelect={setSelectedEventId} />
      )}
    </div>
  )
}

export default App
