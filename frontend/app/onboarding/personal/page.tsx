'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Loader2, Bold, Italic, List, Table, Sparkles, Info } from 'lucide-react'
import { authService } from '@/services/auth'
import { toast } from 'sonner'

const ALL_NATIONS = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czechia',
  "Côte d'Ivoire","Democratic Republic of the Congo","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia",
  'Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania','Luxembourg',
  'Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania','Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal','Qatar',
  'Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria',
  'Taiwan','Tajikistan','Tanzania','Thailand','Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
]

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selected = textarea.value.substring(start, end)
  const wrapped = selected ? `${before}${selected}${after}` : `${before}${after}`
  const newVal = textarea.value.substring(0, start) + wrapped + textarea.value.substring(end)
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set
  nativeInputValueSetter?.call(textarea, newVal)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  textarea.focus()
  textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 0))
}

function insertTable(textarea: HTMLTextAreaElement) {
  const table = '<table><tr><th>Skill</th><th>Level</th></tr><tr><td></td><td></td></tr></table>'
  const start = textarea.selectionStart
  const newVal = textarea.value.substring(0, start) + table + textarea.value.substring(textarea.selectionEnd)
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  )?.set
  nativeInputValueSetter?.call(textarea, newVal)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
  textarea.focus()
}

export default function PersonalPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [nationality, setNationality] = useState('')
  const [gender, setGender] = useState('')
  const [province, setProvince] = useState('')
  const [profession, setProfession] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiPolishing, setAiPolishing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const validate = () => {
    if (!fullName.trim()) { toast.error('Full name is required'); return false }
    if (!dob) { toast.error('Date of birth is required'); return false }
    if (!nationality) { toast.error('Nationality is required'); return false }
    if (!gender) { toast.error('Gender is required'); return false }
    if (!profession) { toast.error('Profession is required'); return false }
    if (!bio.trim()) { toast.error('Short bio is required'); return false }
    return true
  }

  const handleContinue = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      const res: any = await authService.updateProfile({
        fullName,
        dob,
        nationality,
        gender,
        province,
        profession,
        bio,
        onboarding_step: 1,
      })
      if (res?.status !== 'success') throw new Error(res?.error || 'Failed to save')
      router.push('/onboarding/location')
    } catch (err: any) {
      const msg = err?.message || err?.error_description || 'Failed to save. Please try again.'
      toast.error(msg)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleAIPolish = async () => {
    if (!fullName || !profession || !gender || !dob || !nationality) {
      toast.error('Please fill in Name, DOB, Gender, Nationality, and Profession first')
      return
    }
    setAiPolishing(true)
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://zedideaarena.com',
          'X-Title': 'ZedIdeaArena',
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [
            { role: 'system', content: 'You write short professional bios (max 300 chars). Return only the bio text — no quotes, no labels, no markdown.' },
            { role: 'user', content: `Write a first-person bio for: ${fullName}, ${profession}, ${gender}, born ${dob}, from ${nationality}${province ? `, ${province}` : ''}. Include their background and aspirations.` },
          ],
          max_tokens: 150,
        }),
      })
      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content?.trim()
      if (reply) {
        setBio(reply.substring(0, 1000))
        toast.success('Bio generated! You can edit it further.')
      } else {
        toast.error('Could not generate bio. Please try again.')
      }
    } catch {
      toast.error('AI service unavailable. Please write your bio manually.')
    } finally {
      setAiPolishing(false)
    }
  }

  const toolbarBtn = (onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-xs"
    >
      {icon}
    </button>
  )

  return (
    <div className="space-y-6 animate-zed-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xl font-black text-zed-foreground">Personal Information</h2>
      </div>
      <p className="text-sm text-zed-foreground-secondary -mt-4">
        Help the community get to know you. Your profile builds trust and showcases who you are.
      </p>

      <div className="p-4 rounded-2xl border border-zed-primary/10 flex items-start gap-3" style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(34,211,238,0.03))' }}>
        <Info size={16} className="text-zed-accent mt-0.5 flex-shrink-0" />
        <p className="text-xs text-zed-foreground-secondary leading-relaxed">
          Your name and bio appear on your public profile. Other details (DOB, gender, nationality, province) are kept private and only used for demographics.
        </p>
      </div>

      <div>
        <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Full Name</label>
        <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Your legal name as it appears on your ID — used for verification and prize payouts.</p>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="input-zed"
          placeholder="e.g. Sean Nyakutira"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Date of Birth</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">To verify you&apos;re eligible to participate.</p>
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="input-zed" />
        </div>
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Gender</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Used for inclusive community analytics.</p>
          <select value={gender} onChange={e => setGender(e.target.value)} className="input-zed">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Nationality</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Your country of citizenship.</p>
          <select value={nationality} onChange={e => setNationality(e.target.value)} className="input-zed">
            <option value="">Select nationality</option>
            {ALL_NATIONS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Province / State</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Helps us understand regional participation.</p>
          <input
            type="text"
            value={province}
            onChange={e => setProvince(e.target.value)}
            className="input-zed"
            placeholder="e.g. Lusaka Province"
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest block mb-1">Profession</label>
          <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Shows the community what you do.</p>
          <select value={profession} onChange={e => setProfession(e.target.value)} className="input-zed">
            <option value="">Select profession</option>
            <option value="Student">Student</option>
            <option value="Entrepreneur">Entrepreneur</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="Product Manager">Product Manager</option>
            <option value="Designer">Designer</option>
            <option value="Artist">Artist</option>
            <option value="Researcher">Researcher</option>
            <option value="Writer">Writer</option>
            <option value="Marketer">Marketer</option>
            <option value="Consultant">Consultant</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] font-black text-zed-foreground-secondary uppercase tracking-widest">
            Short Bio <span className="text-zed-foreground-secondary/50 font-normal">({bio.length}/1000)</span>
          </label>
          <button
            type="button"
            onClick={handleAIPolish}
            disabled={aiPolishing}
            className="flex items-center gap-1.5 text-[10px] font-bold text-zed-accent hover:text-white px-3 py-1.5 rounded-lg border border-zed-accent/20 hover:bg-zed-accent/10 transition-all disabled:opacity-30"
          >
            <Sparkles size={12} />
            {aiPolishing ? 'Generating...' : 'Polish with AI'}
          </button>
        </div>
        <p className="text-[10px] text-zed-foreground-secondary/50 mb-2">Tell the community about yourself. Use formatting to make it shine.</p>
        <div className="flex items-center gap-0.5 mb-1 px-1 py-1.5 rounded-t-xl border border-b-0 border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
          {toolbarBtn(() => textareaRef.current && wrapSelection(textareaRef.current, '<strong>', '</strong>'), <Bold size={13} />, 'Bold')}
          <span className="w-px h-4 bg-white/10 mx-0.5" />
          {toolbarBtn(() => textareaRef.current && wrapSelection(textareaRef.current, '<em>', '</em>'), <Italic size={13} />, 'Italic')}
          <span className="w-px h-4 bg-white/10 mx-0.5" />
          {toolbarBtn(() => textareaRef.current && wrapSelection(textareaRef.current, '\n- ', ''), <List size={13} />, 'Bullet List')}
          <span className="w-px h-4 bg-white/10 mx-0.5" />
          {toolbarBtn(() => textareaRef.current && insertTable(textareaRef.current), <Table size={13} />, 'Insert Table')}
        </div>
        <textarea
          ref={textareaRef}
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={1000}
          rows={5}
          className="input-zed rounded-t-none font-mono text-xs leading-relaxed"
          placeholder="e.g. I am a **software engineer** from Lusaka, passionate about building fintech solutions for Africa.&#10;&#10;Skills:&#10;- Product design&#10;- Full-stack development&#10;- Team leadership"
        />
        <p className="text-[9px] text-zed-foreground-secondary/40 mt-1">Use the toolbar above to add formatting, or type <strong className="text-white/60">**bold**</strong> and <em className="text-white/60">*italic*</em> manually.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-600 border-2 border-red-400 rounded-2xl shadow-lg shadow-red-600/30">
          <p className="text-sm font-bold text-white">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="btn-primary px-10 h-14 flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 size={18} className="animate-spin" /> Saving...</>
          ) : (
            <>Continue <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  )
}
