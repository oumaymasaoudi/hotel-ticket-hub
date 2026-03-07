import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AutoCompleteOption {
  value: string
  label: string
  metadata?: Record<string, unknown>
}

interface AutoCompleteInputProps {
  value: string
  onChange: (value: string) => void
  options: AutoCompleteOption[]
  placeholder?: string
  className?: string
  onSelect?: (option: AutoCompleteOption) => void
  filterFn?: (option: AutoCompleteOption, query: string) => boolean
}

export function AutoCompleteInput({
  value,
  onChange,
  options,
  placeholder = "Rechercher...",
  className,
  onSelect,
  filterFn,
}: AutoCompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const defaultFilterFn = (option: AutoCompleteOption, query: string) => {
    const queryLower = query.toLowerCase()
    return (
      option.label.toLowerCase().includes(queryLower) ||
      option.value.toLowerCase().includes(queryLower)
    )
  }

  const filter = filterFn || defaultFilterFn

  const filteredOptions = inputValue
    ? options.filter((option) => filter(option, inputValue))
    : options

  const selectedOption = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          onClick={() => setOpen(!open)}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={inputValue}
            onValueChange={(newValue) => {
              setInputValue(newValue)
              onChange(newValue)
            }}
          />
          <CommandList>
            <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value)
                    setInputValue(option.label)
                    setOpen(false)
                    if (onSelect) {
                      onSelect(option)
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Version avec input libre (non contrôlé)
export function AutoCompleteInputFree({
  value,
  onChange,
  options,
  placeholder = "Tapez pour rechercher...",
  className,
  onSelect,
  filterFn,
}: AutoCompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const defaultFilterFn = (option: AutoCompleteOption, query: string) => {
    const queryLower = query.toLowerCase()
    return (
      option.label.toLowerCase().includes(queryLower) ||
      option.value.toLowerCase().includes(queryLower)
    )
  }

  const filter = filterFn || defaultFilterFn

  const filteredOptions = inputValue
    ? options.filter((option) => filter(option, inputValue))
    : []

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value
          setInputValue(newValue)
          onChange(newValue)
          setOpen(newValue.length > 0 && filteredOptions.length > 0)
        }}
        onFocus={() => {
          if (filteredOptions.length > 0) {
            setOpen(true)
          }
        }}
        onBlur={() => {
          // Délai pour permettre le clic sur une option
          setTimeout(() => setOpen(false), 200)
        }}
        placeholder={placeholder}
        className={className}
      />
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className="px-4 py-2 cursor-pointer hover:bg-accent"
              onMouseDown={(e) => {
                e.preventDefault()
                setInputValue(option.label)
                onChange(option.value)
                setOpen(false)
                if (onSelect) {
                  onSelect(option)
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

