'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Heading1, Heading2, Heading3, Table2, Minus, Pilcrow,
  Mic, MicOff,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: { error: string }) => void
  onend: () => void
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: new () => SpeechRecognition
  webkitSpeechRecognition: new () => SpeechRecognition
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
  minLength?: number
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  label: string
  icon: React.ReactNode
}

function ToolbarButton({ onClick, active, label, icon }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg text-xs transition-all duration-200 ${
        active
          ? 'bg-zed-primary/20 text-zed-primary shadow-sm shadow-zed-primary/10'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      {icon}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1" />
}

export default function RichTextEditor({ value, onChange, placeholder, maxLength = 5000, minLength = 20 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CharacterCount.configure({ limit: maxLength }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const charCount = editor?.storage.characterCount?.characters?.() || value.replace(/<[^>]*>/g, '').length

  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef<string>('')
  const shouldRestartRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as unknown as WindowWithSpeechRecognition
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
      if (SpeechRecognition) {
        setSpeechSupported(true)
      }
    }
  }, [])

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null
    const win = window as unknown as WindowWithSpeechRecognition
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' '
        }
      }
    }

    recognition.onerror = (event: { error: string }) => {
      console.warn('Speech recognition error:', event.error)
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setPermissionDenied(true)
        setIsListening(false)
        shouldRestartRef.current = false
      } else if (event.error !== 'no-speech') {
        setIsListening(false)
        shouldRestartRef.current = false
      }
    }

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try { recognition.start() } catch {}
      } else {
        setIsListening(false)
      }
    }

    return recognition
  }, [])

  const toggleListening = useCallback(() => {
    if (!speechSupported) return

    if (isListening) {
      shouldRestartRef.current = false
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      setPermissionDenied(false)
      finalTranscriptRef.current = ''
      shouldRestartRef.current = true

      const recognition = recognitionRef.current || initRecognition()
      if (!recognition) return

      recognitionRef.current = recognition

      try {
        recognition.start()
        setIsListening(true)
      } catch (e) {
        console.warn('Could not start speech recognition:', e)
      }
    }
  }, [isListening, speechSupported, initRecognition])

  useEffect(() => {
    if (!isListening && finalTranscriptRef.current.trim() && editor) {
      const text = finalTranscriptRef.current.trim()
      editor.chain().focus().insertContent(text + ' ').run()
      finalTranscriptRef.current = ''
    }
  }, [isListening, editor])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        shouldRestartRef.current = false
        recognitionRef.current.stop()
      }
    }
  }, [])

  if (!editor) return null

  return (
    <div className="rich-text-editor rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 focus-within:border-zed-primary/40 focus-within:shadow-sm focus-within:shadow-zed-primary/5">
      <div className="flex items-center gap-1 p-2 px-3 border-b border-white/5 flex-wrap bg-white/[0.02]">
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            label="Bold"
            icon={<Bold size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            label="Italic"
            icon={<Italic size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            label="Underline"
            icon={<UnderlineIcon size={16} />}
          />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            label="Heading 1"
            icon={<Heading1 size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            label="Heading 2"
            icon={<Heading2 size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            label="Heading 3"
            icon={<Heading3 size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
            label="Paragraph"
            icon={<Pilcrow size={16} />}
          />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            label="Bullet List"
            icon={<List size={16} />}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            label="Ordered List"
            icon={<ListOrdered size={16} />}
          />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={editor.isActive('table')}
            label="Insert Table"
            icon={<Table2 size={16} />}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {editor.isActive('table') && (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                active={false}
                label="Add Column Before"
                icon={<span className="text-[9px] font-bold">|◀</span>}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                active={false}
                label="Add Column After"
                icon={<span className="text-[9px] font-bold">▶|</span>}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowBefore().run()}
                active={false}
                label="Add Row Before"
                icon={<span className="text-[9px] font-bold">▲_</span>}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().addRowAfter().run()}
                active={false}
                label="Add Row After"
                icon={<span className="text-[9px] font-bold">_▼</span>}
              />
              <ToolbarButton
                onClick={() => editor.chain().focus().deleteTable().run()}
                active={false}
                label="Delete Table"
                icon={<span className="text-[9px] font-bold text-red-400">✕</span>}
              />
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <EditorContent editor={editor} className="prose-editor" />

        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            title={
              permissionDenied
                ? 'Microphone access denied — allow in browser settings'
                : isListening
                ? 'Stop dictation'
                : 'Start dictation'
            }
            className={`absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full transition-all duration-300 ${
              isListening
                ? 'w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/40 scale-110'
                : permissionDenied
                ? 'w-14 h-14 bg-white/10 border border-red-500/30 opacity-60 cursor-not-allowed'
                : 'w-12 h-12 bg-zed-gradient-primary shadow-zed-glow-primary hover:scale-110 hover:shadow-zed-glow-accent'
            }`}
          >
            {isListening ? (
              <Mic size={24} className="text-white animate-pulse" />
            ) : (
              <MicOff size={20} className="text-white" />
            )}
          </button>
        )}

        {isListening && (
          <div className="absolute bottom-20 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-medium text-red-300">Listening...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] font-medium">
          <span className={charCount < minLength ? 'text-amber-400' : 'text-white/30'}>
            Min: {minLength}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className={`h-1.5 w-24 rounded-full overflow-hidden ${
              charCount > maxLength ? 'bg-red-500/20' : 'bg-white/5'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                charCount > maxLength
                  ? 'bg-red-500'
                  : charCount > maxLength * 0.9
                  ? 'bg-amber-500'
                  : 'bg-white/20'
              }`}
              style={{ width: `${Math.min((charCount / maxLength) * 100, 100)}%` }}
            />
          </div>
          <span
            className={`text-[11px] font-mono font-bold ${
              charCount > maxLength
                ? 'text-red-400'
                : charCount > maxLength * 0.9
                ? 'text-amber-400'
                : 'text-white/30'
            }`}
          >
            {charCount.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
