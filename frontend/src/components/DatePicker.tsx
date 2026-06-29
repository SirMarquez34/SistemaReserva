import { useState } from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  minDate?: string
}

function toISO(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function DatePicker({ value, onChange, minDate }: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const initial = value ? new Date(value + 'T00:00:00') : today
  const [viewYear, setViewYear]   = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  const minD = minDate ? new Date(minDate + 'T00:00:00') : today

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  // Build calendar grid (6 rows × 7 cols)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate()

  const cells: { day: number; month: 'prev' | 'cur' | 'next'; iso: string }[] = []

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    const m = viewMonth === 0 ? 11 : viewMonth - 1
    const y = viewMonth === 0 ? viewYear - 1 : viewYear
    cells.push({ day: d, month: 'prev', iso: toISO(y, m, d) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: 'cur', iso: toISO(viewYear, viewMonth, d) })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1
    const y = viewMonth === 11 ? viewYear + 1 : viewYear
    cells.push({ day: d, month: 'next', iso: toISO(y, m, d) })
  }

  function isDisabled(iso: string) {
    return new Date(iso + 'T00:00:00') < minD
  }
  function isToday(iso: string) {
    return iso === toISO(today.getFullYear(), today.getMonth(), today.getDate())
  }
  function isSelected(iso: string) { return iso === value }

  return (
    <div style={{ background: '#0e0c08', border: '1px solid #2a2419', padding: '18px 16px', userSelect: 'none' }}>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button onClick={prevMonth}
          style={{ background: 'none', border: 'none', color: '#857e71', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}>
          <MdChevronLeft style={{ fontSize: 20 }} />
        </button>

        <p style={{ fontFamily: 'Cinzel, serif', fontWeight: 600, fontSize: 13, letterSpacing: '.14em', color: '#e9d9a8', margin: 0 }}>
          {MESES[viewMonth]} {viewYear}
        </p>

        <button onClick={nextMonth}
          style={{ background: 'none', border: 'none', color: '#857e71', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, transition: 'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#d4a53c')}
          onMouseLeave={e => (e.currentTarget.style.color = '#857e71')}>
          <MdChevronRight style={{ fontSize: 20 }} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontFamily: 'Mulish', fontWeight: 700, fontSize: 10, letterSpacing: '.1em', color: '#4a4334', padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((cell, idx) => {
          const disabled = isDisabled(cell.iso)
          const selected = isSelected(cell.iso)
          const today_   = isToday(cell.iso)
          const outside  = cell.month !== 'cur'

          return (
            <button
              key={idx}
              onClick={() => !disabled && !outside && onChange(cell.iso)}
              disabled={disabled || outside}
              style={{
                width: '100%', aspectRatio: '1', border: 'none', cursor: disabled || outside ? 'default' : 'pointer',
                fontFamily: 'Mulish', fontWeight: selected ? 800 : 600, fontSize: 13,
                transition: 'all .15s',
                background: selected
                  ? '#d4a53c'
                  : today_ && !selected
                    ? 'rgba(212,165,60,0.1)'
                    : 'transparent',
                color: selected
                  ? '#161009'
                  : outside
                    ? '#2a2419'
                    : disabled
                      ? '#3a3328'
                      : today_
                        ? '#d4a53c'
                        : '#c8bfb0',
                outline: today_ && !selected ? '1px solid rgba(212,165,60,0.35)' : 'none',
              }}
              onMouseEnter={e => {
                if (!disabled && !outside && !selected)
                  e.currentTarget.style.background = 'rgba(212,165,60,0.12)'
              }}
              onMouseLeave={e => {
                if (!disabled && !outside && !selected)
                  e.currentTarget.style.background = today_ ? 'rgba(212,165,60,0.1)' : 'transparent'
              }}
            >
              {cell.day}
            </button>
          )
        })}
      </div>

      {/* Selected date label */}
      {value && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #2a2419', textAlign: 'center' }}>
          <span style={{ fontFamily: 'Mulish', fontSize: 12, color: '#857e71' }}>
            Seleccionado:{' '}
            <span style={{ color: '#d4a53c', fontWeight: 700 }}>
              {new Date(value + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </span>
        </div>
      )}
    </div>
  )
}
