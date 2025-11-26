import { useState, useEffect } from 'react'

function App() {
  const [palette, setPalette] = useState([])
  const [savedPalettes, setSavedPalettes] = useState([])
  const [copiedColor, setCopiedColor] = useState('')

  useEffect(() => {
    generatePalette()
    const saved = localStorage.getItem('savedPalettes')
    if (saved) {
      setSavedPalettes(JSON.parse(saved))
    }
  }, [])

  const randomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  }

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHsl = (r, g, b) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const generatePalette = () => {
    const colors = []
    for (let i = 0; i < 5; i++) {
      colors.push(randomColor())
    }
    setPalette(colors)
  }

  const generateMonochrome = () => {
    const baseColor = randomColor()
    const rgb = hexToRgb(baseColor)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    const colors = []
    for (let i = 0; i < 5; i++) {
      const lightness = 20 + (i * 16)
      const h = hsl.h
      const s = hsl.s
      const l = lightness
      const color = hslToHex(h, s, l)
      colors.push(color)
    }
    setPalette(colors)
  }

  const generateAnalogous = () => {
    const baseHue = Math.floor(Math.random() * 360)
    const colors = []

    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + (i * 30)) % 360
      const color = hslToHex(hue, 70, 50)
      colors.push(color)
    }
    setPalette(colors)
  }

  const generateComplementary = () => {
    const baseHue = Math.floor(Math.random() * 360)
    const complementHue = (baseHue + 180) % 360

    const colors = [
      hslToHex(baseHue, 70, 30),
      hslToHex(baseHue, 70, 50),
      hslToHex(baseHue, 70, 70),
      hslToHex(complementHue, 70, 50),
      hslToHex(complementHue, 70, 70)
    ]
    setPalette(colors)
  }

  const hslToHex = (h, s, l) => {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = n => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const copyToClipboard = async (color) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const savePalette = () => {
    const newPalettes = [...savedPalettes, { id: Date.now(), colors: palette }]
    setSavedPalettes(newPalettes)
    localStorage.setItem('savedPalettes', JSON.stringify(newPalettes))
  }

  const deleteSavedPalette = (id) => {
    const newPalettes = savedPalettes.filter(p => p.id !== id)
    setSavedPalettes(newPalettes)
    localStorage.setItem('savedPalettes', JSON.stringify(newPalettes))
  }

  const loadPalette = (colors) => {
    setPalette(colors)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">🎨 Color Palette Generator</h1>
          <p className="subtitle">Create beautiful color palettes for your next project</p>
        </header>

        <div className="controls">
          <button onClick={generatePalette} className="btn btn-primary">
            🎲 Random
          </button>
          <button onClick={generateMonochrome} className="btn btn-secondary">
            🌑 Monochrome
          </button>
          <button onClick={generateAnalogous} className="btn btn-secondary">
            🌈 Analogous
          </button>
          <button onClick={generateComplementary} className="btn btn-secondary">
            ⚖️ Complementary
          </button>
          <button onClick={savePalette} className="btn btn-save">
            💾 Save
          </button>
        </div>

        <div className="palette">
          {palette.map((color, index) => (
            <div
              key={index}
              className="color-card"
              style={{ backgroundColor: color }}
              onClick={() => copyToClipboard(color)}
            >
              <div className="color-info">
                <span className="color-code">{color}</span>
                {copiedColor === color && <span className="copied">Copied!</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="info">
          <p>💡 Click on any color to copy its hex code</p>
          <p>Press <kbd>Space</kbd> to generate a new random palette</p>
        </div>

        {savedPalettes.length > 0 && (
          <div className="saved-section">
            <h2 className="saved-title">💾 Saved Palettes</h2>
            <div className="saved-palettes">
              {savedPalettes.map((saved) => (
                <div key={saved.id} className="saved-palette">
                  <div className="saved-colors">
                    {saved.colors.map((color, index) => (
                      <div
                        key={index}
                        className="saved-color"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                        title={color}
                      />
                    ))}
                  </div>
                  <div className="saved-actions">
                    <button
                      onClick={() => loadPalette(saved.colors)}
                      className="btn-small"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedPalette(saved.id)}
                      className="btn-small btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Keyboard shortcut for generating palette
if (typeof window !== 'undefined') {
  let generateFn = null
  window.setGenerateFn = (fn) => { generateFn = fn }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault()
      if (generateFn) generateFn()
    }
  })
}

export default App
