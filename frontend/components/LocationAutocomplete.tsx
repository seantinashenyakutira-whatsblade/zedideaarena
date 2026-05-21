'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface LocationResult {
  country: string
  city: string
}

interface LocationAutocompleteProps {
  value?: LocationResult
  onChange: (location: LocationResult) => void
  placeholder?: string
}

export function LocationAutocomplete({ value, onChange, placeholder = 'Search your location' }: LocationAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      v: 'weekly',
      libraries: ['places', 'geocoding'],
    })
    Promise.all([
      importLibrary('places'),
      importLibrary('geocoding'),
    ]).then(([places, geocoding]) => {
      autocompleteRef.current = new places.AutocompleteService()
      geocoderRef.current = new geocoding.Geocoder()
      setScriptLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!query || query.length < 2 || !autocompleteRef.current) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setLoading(true)
    autocompleteRef.current.getPlacePredictions(
      { input: query, types: ['locality', 'administrative_area_level_1', 'country'] },
      (results, status) => {
        setLoading(false)
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setSuggestions(results)
          setOpen(true)
        } else {
          setSuggestions([])
          setOpen(false)
        }
      }
    )
  }, [query, scriptLoaded])

  const selectPlace = (placeId: string) => {
    if (!geocoderRef.current) return
    geocoderRef.current.geocode({ placeId }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) return
      const addr = results[0]
      let country = ''
      let city = ''
      for (const comp of addr.address_components) {
        if (comp.types.includes('country')) country = comp.long_name
        if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2') || comp.types.includes('postal_town')) {
          city = comp.long_name
        }
      }
      setQuery(addr.formatted_address || '')
      setOpen(false)
      onChange({ country, city })
    })
  }

  const displayValue = value ? `${value.city}, ${value.country}` : query

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3.5 text-zed-foreground-secondary" size={18} />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={placeholder}
          className="input-zed pl-10"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-3 top-3.5 animate-spin text-zed-primary" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zed-background border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <button
              key={s.place_id}
              type="button"
              onMouseDown={() => selectPlace(s.place_id)}
              className="w-full text-left px-4 py-3 text-sm text-zed-foreground hover:bg-white/5 transition-colors flex items-center gap-3"
            >
              <MapPin size={14} className="text-zed-foreground-secondary flex-shrink-0" />
              <span>{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
