'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, MapPin, Crosshair } from 'lucide-react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

interface LocationResult {
  country: string
  city: string
  address: string
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
  const [locating, setLocating] = useState(false)
  const [open, setOpen] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [geoError, setGeoError] = useState('')
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

  const extractCityCountry = (addr: google.maps.GeocoderResult) => {
    let country = ''
    let city = ''
    for (const comp of addr.address_components) {
      if (comp.types.includes('country')) country = comp.long_name
      if (comp.types.includes('locality') || comp.types.includes('administrative_area_level_2') || comp.types.includes('postal_town')) {
        city = comp.long_name
      }
    }
    return { country, city }
  }

  const selectPlace = (placeId: string) => {
    if (!geocoderRef.current) return
    geocoderRef.current.geocode({ placeId }, (results, status) => {
      if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) return
      const addr = results[0]
      const { country, city } = extractCityCountry(addr)
      setQuery(addr.formatted_address || '')
      setOpen(false)
      onChange({ country, city, address: addr.formatted_address || '' })
    })
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (!geocoderRef.current) {
          setLocating(false)
          setGeoError('Map service not ready yet')
          return
        }
        geocoderRef.current.geocode(
          { location: { lat: latitude, lng: longitude } },
          (results, status) => {
            setLocating(false)
            if (status !== google.maps.GeocoderStatus.OK || !results?.[0]) {
              setGeoError('Could not determine your address')
              return
            }
            const addr = results[0]
            const { country, city } = extractCityCountry(addr)
            setQuery(addr.formatted_address || '')
            onChange({ country, city, address: addr.formatted_address || '' })
          }
        )
      },
      (err) => {
        setLocating(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission denied. Please search manually.')
            break
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location unavailable. Please search manually.')
            break
          default:
            setGeoError('Failed to get location. Please search manually.')
        }
      }
    )
  }

  const displayValue = value?.address ? value.address : value ? `${value.city}, ${value.country}` : query

  return (
    <div className="space-y-3">
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
      {!scriptLoaded ? (
        <div className="flex items-center gap-2 text-xs text-zed-foreground-secondary">
          <Loader2 size={12} className="animate-spin" />
          Loading map services...
        </div>
      ) : (
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={locating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors text-xs font-black uppercase tracking-widest text-zed-primary disabled:opacity-50"
        >
          {locating ? (
            <><Loader2 size={14} className="animate-spin" /> Locating...</>
          ) : (
            <><Crosshair size={14} /> Use Current Location</>
          )}
        </button>
      )}
      {geoError && (
        <p className="text-xs text-red-400">{geoError}</p>
      )}
    </div>
  )
}
