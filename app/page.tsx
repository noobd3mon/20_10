'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'

export default function Home() {
  const [showCastle, setShowCastle] = useState(false)
  const [showRose, setShowRose] = useState(true)
  const [showSvg, setShowSvg] = useState(false)
  const [showTextClick, setShowTextClick] = useState(false)
  const [showLetterForm, setShowLetterForm] = useState(false)
  const [letterTitle, setLetterTitle] = useState('')
  const [letterContent, setLetterContent] = useState('')
  const [cardTop, setCardTop] = useState(5)
  const [isMouseOver, setIsMouseOver] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)
  const shapeRef = useRef<SVGPathElement>(null)
  const partialPathRef = useRef<SVGPathElement>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Show "Click me now" text after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTextClick(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // Initialize anime.js for rose drawing
  useEffect(() => {
    if (typeof window !== 'undefined' && showRose) {
      const loadAnime = async () => {
        const anime = (await import('animejs')).default

        const lineDrawing = anime({
          targets: ['.leafOne', '.stickLine', '.leafTwo', '.leafS1', '.rose1', '.rose2', '.rose3', '.rose4'],
          strokeDashoffset: [anime.setDashoffset, 0],
          easing: 'easeInOutCubic',
          duration: 4000,
          begin: function () {
            const elements = [
              { selector: '.leafOne', stroke: 'black', fill: 'none' },
              { selector: '.leafTwo', stroke: 'black', fill: 'none' },
              { selector: '.stickLine', stroke: 'black', fill: 'none' },
              { selector: '.leafS1', stroke: 'black', fill: 'none' },
              { selector: '.rose1', stroke: 'black', fill: 'none' },
              { selector: '.rose2', stroke: 'black', fill: 'none' },
              { selector: '.rose3', stroke: 'black', fill: 'none' },
              { selector: '.rose4', stroke: 'black', fill: 'none' },
            ]

            elements.forEach(({ selector, stroke, fill }) => {
              const el = document.querySelector(selector)
              if (el) {
                el.setAttribute('stroke', stroke)
                el.setAttribute('fill', fill)
              }
            })
          },
          complete: function () {
            const elements = [
              { selector: '.leafOne', stroke: 'none', fill: '#9CDD05' },
              { selector: '.leafTwo', stroke: 'none', fill: '#9CDD05' },
              { selector: '.stickLine', stroke: 'none', fill: '#83AA2E' },
              { selector: '.leafS1', stroke: 'none', fill: '#9CDD05' },
              { selector: '.rose1', stroke: 'none', fill: '#F37D79' },
              { selector: '.rose2', stroke: 'none', fill: '#D86666' },
              { selector: '.rose3', stroke: 'none', fill: '#F37D79' },
              { selector: '.rose4', stroke: 'none', fill: '#D86666' },
            ]

            elements.forEach(({ selector, stroke, fill }) => {
              const el = document.querySelector(selector)
              if (el) {
                el.setAttribute('stroke', stroke)
                el.setAttribute('fill', fill)
              }
            })
          },
          autoplay: true,
        })
      }

      loadAnime()
    }
  }, [showRose])

  // SVG path animation logic
  useEffect(() => {
    if (!showSvg || !shapeRef.current || !partialPathRef.current) return

    const shape = shapeRef.current
    const partialPath = partialPathRef.current
    const pathlength = shape.getTotalLength()

    let t = 0
    let lengthAtT = pathlength * t
    const d = shape.getAttribute('d') || ''
    const n = (d.match(/C/gi) || []).length

    interface SubPath {
      d: string
      pointsRy: number[]
      pathLength: number
      previous: SubPath | null
      M_point: number[]
      lastCubicBezier: number[][]
    }

    class SubPathClass {
      d: string
      pointsRy: number[]
      previous: SubPath | null
      pathLength: number
      M_point: number[]
      lastCubicBezier: number[][]

      constructor(d: string, previous: SubPath | null) {
        this.d = d
        this.previous = previous
        this.pointsRy = this.getPointsRy()
        this.pathLength = this.measurePath()
        this.M_point = this.getMPoint()
        this.lastCubicBezier = this.getLastCubicBezier()
      }

      getPointsRy(): number[] {
        const temp = this.d.split(/[A-Z,a-z\s,]/).filter((v) => v)
        return temp.map((item) => parseFloat(item))
      }

      measurePath(): number {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttributeNS(null, 'd', this.d)
        return path.getTotalLength()
      }

      getMPoint(): number[] {
        if (this.previous) {
          const p = this.previous.pointsRy
          const l = p.length
          return [p[l - 2], p[l - 1]]
        } else {
          const p = this.pointsRy
          return [p[0], p[1]]
        }
      }

      getLastCubicBezier(): number[][] {
        const lastIndexOfC = this.d.lastIndexOf('C')
        const temp = this.d
          .substring(lastIndexOfC + 1)
          .split(/[\s,]/)
          .filter((v) => v)
        const _temp = temp.map((item) => parseFloat(item))
        const result: number[][] = [this.M_point]
        for (let i = 0; i < _temp.length; i += 2) {
          result.push(_temp.slice(i, i + 2))
        }
        return result
      }
    }

    const subpaths: SubPath[] = []
    let pos = 0

    for (let i = 0; i < n; i++) {
      const newpos = d.indexOf('C', pos + 1)
      if (i > 0) {
        const sPath = new SubPathClass(d.substring(0, newpos), subpaths.length > 0 ? subpaths[subpaths.length - 1] : null)
        subpaths.push(sPath)
      }
      pos = newpos
    }
    subpaths.push(new SubPathClass(d, subpaths.length > 0 ? subpaths[subpaths.length - 1] : null))

    function lerp(A: number[], B: number[], t: number): number[] {
      return [(B[0] - A[0]) * t + A[0], (B[1] - A[1]) * t + A[1]]
    }

    function getBezierPoints(t: number, points: number[][]): number[][] {
      const helperPoints: number[][] = []

      for (let i = 1; i < 4; i++) {
        const p = lerp(points[i - 1], points[i], t)
        helperPoints.push(p)
      }

      helperPoints.push(lerp(helperPoints[0], helperPoints[1], t))
      helperPoints.push(lerp(helperPoints[1], helperPoints[2], t))
      helperPoints.push(lerp(helperPoints[3], helperPoints[4], t))

      return [points[0], helperPoints[0], helperPoints[3], helperPoints[5]]
    }

    function drawCBezier(points: number[][], path: SVGPathElement, index: number) {
      let d: string

      if (index > 0) {
        d = subpaths[index].previous!.d
      } else {
        d = `M${points[0][0]},${points[0][1]} C`
      }

      for (let i = 1; i < 4; i++) {
        d += ` ${points[i][0]},${points[i][1]} `
      }
      path.setAttributeNS(null, 'd', d)
    }

    function getT(t: number, index: number): number {
      const lengthAtT = pathlength * t
      if (index > 0) {
        return (lengthAtT - subpaths[index].previous!.pathLength) / (subpaths[index].pathLength - subpaths[index].previous!.pathLength)
      } else {
        return lengthAtT / subpaths[index].pathLength
      }
    }

    let index = 0
    for (index = 0; index < subpaths.length; index++) {
      if (subpaths[index].pathLength >= lengthAtT) {
        break
      }
    }

    let T = getT(t, index)
    let newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier)
    drawCBezier(newPoints, partialPath, index)

    function typing() {
      animationFrameRef.current = window.requestAnimationFrame(typing)
      if (t >= 1) {
        if (animationFrameRef.current) {
          window.cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
      } else {
        t += 0.0025
      }

      lengthAtT = pathlength * t
      for (index = 0; index < subpaths.length; index++) {
        if (subpaths[index].pathLength >= lengthAtT) {
          break
        }
      }
      T = getT(t, index)
      newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier)
      drawCBezier(newPoints, partialPath, index)
    }

    typing()

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [showSvg])

  // Create magic dust effect
  useEffect(() => {
    if (!showCastle) return

    const head = document.getElementsByTagName('head')[0]
    let animationId = 1

    function CreateMagicDust(
      x1: number,
      x2: number,
      y1: number,
      y2: number,
      sizeRatio: number,
      fallingTime: number,
      animationDelay: number,
      node: string = 'castle'
    ) {
      const dust = document.createElement('span')
      const animation = document.createElement('style')
      animation.innerHTML = `
        @keyframes blink${animationId} {
          0% {
            top: ${y1}px;
            left: ${x1}px;
            width: ${2 * sizeRatio}px;
            height: ${2 * sizeRatio}px;
            opacity: .4
          }
          20% {
            width: ${4 * sizeRatio}px;
            height: ${4 * sizeRatio}px;
            opacity: .8
          }
          35% {
            width: ${2 * sizeRatio}px;
            height: ${2 * sizeRatio}px;
            opacity: .5
          }
          55% {
            width: ${3 * sizeRatio}px;
            height: ${3 * sizeRatio}px;
            opacity: .7
          }
          80% {
            width: ${sizeRatio}px;
            height: ${sizeRatio}px;
            opacity: .3
          }
          100% {
            top: ${y2}px;
            left: ${x2}px;
            width: 0px;
            height: 0px;
            opacity: .1
          }
        }`
      head.appendChild(animation)
      dust.classList.add('dustDef')
      dust.setAttribute('style', `animation: blink${animationId++} ${fallingTime}s cubic-bezier(.71, .11, .68, .83) infinite ${animationDelay}s`)
      const castleEl = document.getElementById(node)
      if (castleEl) {
        castleEl.appendChild(dust)
      }
    }

    const dustParticles: [number, number, number, number, number, number, number, string?][] = [
      [130, 132, 150, 152, 0.15, 2.5, 0.1],
      [65, 63, 300, 299, 0.5, 2, 0.2],
      [70, 70, 150, 150, 0.45, 2, 0.5],
      [75, 78, 160, 170, 0.6, 2, 1],
      [80, 82, 160, 180, 0.6, 1, 0.4],
      [85, 100, 160, 170, 0.5, 2, 0.5],
      [125, 110, 170, 180, 0.25, 3, 1.5],
      [90, 90, 115, 115, 0.4, 2, 2],
      [93, 95, 200, 200, 0.4, 3, 1.5],
      [100, 100, 145, 155, 0.45, 1, 0.5],
      [100, 90, 170, 230, 0.35, 2, 0.75],
      [100, 102, 115, 112, 0.35, 3, 0.25],
      [100, 95, 170, 200, 0.55, 1.5, 0.75],
      [100, 97, 150, 190, 0.7, 2, 1.5],
      [105, 100, 160, 180, 0.5, 1.5, 0.725],
      [125, 125, 180, 190, 0.25, 1, 0.725],
      [130, 130, 135, 135, 0.45, 3, 1.5],
      [135, 132, 170, 190, 0.25, 2.5, 0.75],
    ]

    dustParticles.forEach((o) => CreateMagicDust(...o))
  }, [showCastle])

  // Typewriter effect for letter title
  useEffect(() => {
    if (!showLetterForm) return

    const textLetterH2 = 'Gửi cậu!'
    const textLetterP = 'Chúc cậu một ngày 20/10 thật tuyệt vời, nhận được nhiều niềm vui và những món quà ý nghĩa nhất.\nTớ thật sự mong cậu luôn được hạnh phúc và rạng rỡ như bây giờ, mãi giữ được nguồn năng lượng tươi tắn, lạc quan đó.\nCậu hãy nhớ là dù có chuyện gì, tớ luôn mong những điều tốt đẹp nhất sẽ đến với cậu.\n\n🥰 Have a great day!\nChúc mừng ngày của cậu nha! ❤️ Love You💗'
    
    let titleIndex = 0
    let contentIndex = 0
    let titleInterval: NodeJS.Timeout | null = null
    let contentTimeout: NodeJS.Timeout | null = null
    let contentInterval: NodeJS.Timeout | null = null
    
    // Reset states
    setLetterTitle('')
    setLetterContent('')

    // Start title typewriter
    titleInterval = setInterval(() => {
      if (titleIndex < textLetterH2.length) {
        const currentText = textLetterH2.substring(0, titleIndex + 1)
        setLetterTitle(currentText)
        titleIndex++
      } else {
        if (titleInterval) {
          clearInterval(titleInterval)
          titleInterval = null
        }
        
        // Start content typewriter after title is complete
        contentTimeout = setTimeout(() => {
          contentInterval = setInterval(() => {
            if (contentIndex < textLetterP.length) {
              const currentText = textLetterP.substring(0, contentIndex + 1)
              setLetterContent(currentText)
              contentIndex++
            } else {
              if (contentInterval) {
                clearInterval(contentInterval)
                contentInterval = null
              }
            }
          }, 100)
        }, 500)
      }
    }, 200)

    return () => {
      if (titleInterval) clearInterval(titleInterval)
      if (contentTimeout) clearTimeout(contentTimeout)
      if (contentInterval) clearInterval(contentInterval)
    }
  }, [showLetterForm])

  const handleRoseClick = useCallback(() => {
    setShowRose(false)
    setShowCastle(true)
    setShowSvg(true)
  }, [])

  const handleCardClick = useCallback(() => {
    setShowLetterForm(true)
  }, [])

  const handleCloseForm = useCallback(() => {
    setShowLetterForm(false)
    setLetterTitle('')
    setLetterContent('')
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsMouseOver(true)
    setCardTop(-90)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsMouseOver(false)
    setCardTop(5)
  }, [])

  return (
    <>
      {/* Rose SVG Container */}
      {showRose && (
        <div className="container" id="rose-t" onClick={handleRoseClick}>
          <svg viewBox="0 0 512 512">
            <path
              className="leafOne"
              d="M124.302,328.222c-2.466-2.901-5.036-5.334-7.648-7.212c-1.884-1.354-4.49-1.207-6.201,0.36
                c-32.608,29.866-18.892,84.017,24.01,94.752c2.251,0.563,4.612-0.548,5.624-2.636c0.407-0.841,0.781-1.732,1.138-2.648
                C111.438,394.378,103.302,355.204,124.302,328.222z"
            />
            <path
              className="stickLine"
              d="M337.625,212.314c2.37-3.44,1.501-8.149-1.939-10.519c-3.44-2.369-8.15-1.501-10.519,1.939
                c-19.493,28.304-43.492,60.076-72.147,92.853l-2.542-30.875c-0.343-4.163-4-7.261-8.158-6.917c-4.163,0.343-7.26,3.995-6.917,8.158
                l3.721,45.196C172.176,385.546,93.558,449.444,4.053,496.37c-3.699,1.94-5.127,6.512-3.187,10.211
                c1.352,2.579,3.983,4.054,6.705,4.054c1.183,0,2.385-0.279,3.505-0.867c63.84-33.47,124.784-76.962,181.511-129.479
                c5.891-2.031,32.15-10.225,68.671-8.819c4.156,0.167,7.689-3.09,7.85-7.266c0.161-4.174-3.092-7.689-7.267-7.849
                c-18.678-0.721-34.824,0.89-47.384,3.036C259.688,314.785,301.126,265.31,337.625,212.314z"
            />
            <path
              className="leafTwo"
              d="M329.58,413.715c30.055,1.827,57.188-13.413,71.993-37.343c1.738-2.81,1.253-6.495-1.142-8.771
                c-13.04-12.394-37.78-21.675-66.625-23.428s-54.527,4.464-68.972,15.187c-2.653,1.969-3.581,5.568-2.196,8.568
                C274.438,393.475,299.525,411.888,329.58,413.715z"
            />
            <path
              className="leafS1"
              d="M370.677,231.945c-8.984-2.411-17.479-7.138-24.516-14.205c-5.085-5.106-8.742-10.981-11.143-17.242
                c-6.645,0.902-13.554,0.516-20.475-1.491c-9.578-2.778-17.805-7.959-24.234-14.68c-12.216,1.01-22.611,4.593-28.859,9.642
                c-1.416,1.145-1.839,3.149-0.999,4.772c7.157,13.821,21.478,23.41,38.131,23.745c11.548,0.232,22.109-4.035,30.031-11.178
                c-2.461,10.379-1.13,21.692,4.621,31.709c8.293,14.445,23.583,22.401,39.142,22.039c1.826-0.042,3.382-1.376,3.705-3.168
                C377.509,253.982,375.658,243.144,370.677,231.945z"
            />
            <path
              className="rose1"
              d="M508.212,99.848c-2.666-4.581-27.324-44.843-71.558-48.206c-4.268-0.223-8.58-0.164-12.816,0.176
                l-1.148,0.092l0.471,1.051c7.005,15.648,9.002,31.447,7.106,48.307l0.877,0.04c11.782,0.538,23.679,3.513,35.362,8.841l0.367,0.168
                l0.355-0.188c10.841-5.728,22.445-6.783,35.477-3.225C506.927,108.058,510.397,103.599,508.212,99.848z M452.476,54.541c-4.96-1.457-10.233-2.474-15.823-2.899c-4.268-0.223-8.58-0.164-12.816,0.176
                l-1.148,0.092l0.471,1.051c7.005,15.648,9.002,31.447,7.106,48.307l0.877,0.04c9.334,0.426,18.74,2.407,28.055,5.851
                C461.04,88.852,458.784,71.19,452.476,54.541z"
            />
            <path
              className="rose2"
              d="M418.642,40.96c-24.19-37.169-71.346-39.455-76.643-39.593c-4.34-0.114-6.582,5.071-3.543,8.22
                c9.38,9.721,14.029,20.406,14.212,32.665l0.005,0.402l0.324,0.242c13.637,10.194,23.714,22.558,29.944,36.731
                c4.198,10.201,6.37,19.468,7.545,29.411l0.996-0.402c8.962-3.617,18.525-6.008,28.405-7.105c3.688-0.322,7.481-0.397,11.274-0.223
                l0.762,0.035C434.378,79.498,430.171,59.623,418.642,40.96z"
            />
            <path
              className="rose3"
              d="M343.8,146.676c13.018-17.726,29.06-30.524,47.682-38.039l0.576-0.232
                c-1.161-9.857-3.49-19.395-7.611-29.408c-20.694-47.084-74.317-58.577-80.363-59.731c-4.853-0.927-8.31,4.471-5.489,8.546
                c21.533,31.149,7.895,59.383-14.633,90.009l0.071,0.029c-16.953,26.497-7.863,61.237,18.513,76.865
                c3.932,2.33,8.219,4.207,12.806,5.537c6.757,1.959,13.752,2.469,20.787,1.514l1.017-0.138l-0.367-0.959
                C330.327,183.817,333.08,162.625,343.8,146.676z"
            />
            <path
              className="rose4"
              d="M510.726,141.7c-3.917-4.747-39.75-46.26-91.009-41.792c-21.664,2.405-52.653,12.308-77.277,45.856
                c-13.392,19.922-16.495,52.272,4.132,72.986c3.371,3.385,7.075,6.243,11.008,8.573c26.325,15.597,61.186,6.961,76.309-20.683
                l0.077,0.062c15.307-34.399,34.961-59.933,71.9-56.082C510.802,151.136,513.867,145.507,510.726,141.7z M370.903,162.627c27.904-38.017,75.307-57.751,121.144-38.743
                c-16.072-12.613-41.381-26.674-72.329-23.977c-21.664,2.405-52.653,12.308-77.277,45.856c-13.392,19.922-16.495,52.272,4.132,72.986
                c3.371,3.385,7.075,6.243,11.008,8.573c4.885,2.894,10.125,4.964,15.515,6.228C354.624,212.802,357.947,181.899,370.903,162.627z"
            />
          </svg>
          <p id="text-click" className={showTextClick ? 'show' : ''}>
            Click me now !
          </p>
        </div>
      )}

      {/* SVG text path animation */}
      {showSvg && (
        <svg style={{ display: showSvg ? 'inherit' : 'none' }} id="theSvg" viewBox="-120 -30 240 180" ref={svgRef}>
          <defs>
            <filter id="f" filterUnits="userSpaceOnUse" x="-120" y="-30" width="120%" height="120%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur"></feGaussianBlur>
              <feOffset in="blur" dx="3" dy="5" result="shadow"></feOffset>
              <feFlood floodColor="rgba(3,0,0,1)" result="color" />
              <feComposite in="color" in2="shadow" operator="in" />
              <feComposite in="SourceGraphic" />
            </filter>
            <path
              id="shape"
              ref={shapeRef}
              d="M0, 21.054 
       C0, 21.054 24.618, -15.165 60.750, 8.554 
       C93.249, 29.888 57.749, 96.888 0, 117.388
       C-57.749, 96.888  -93.249, 29.888 -60.750, 8.554
       C-24.618, -15.165  -0, 21.054 -0, 21.054z    
    "
            />
            <path id="partialPath" ref={partialPathRef} />
          </defs>

          <text dy="-2">
            <textPath style={{ fontFamily: 'fantasy' }} xlinkHref="#partialPath" startOffset="12">
              🌹Happy Women&apos;s Day
              🌹.........................................................................................................................................🌹From With Love 20/10!🌹
            </textPath>
          </text>

          <use id="useThePath" xlinkHref="#partialPath" stroke="white" strokeWidth=".5" strokeOpacity=".5" fill="none" style={{ display: 'none' }} />
        </svg>
      )}

      {/* Castle/Letter Container */}
      {showCastle && (
        <div id="castle" style={{ display: 'flex' }}>
          <div className="letter">
            <div
              className="valentines"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleMouseEnter}
              onTouchEnd={handleMouseLeave}
              onClick={handleCardClick}
            >
              <div className="envelope"></div>
              <div className="front"></div>
              <div className="card" style={{ top: `${cardTop}px` }}>
                <div className="text">
                  Happy
                  <br /> Women&apos;s
                  <br /> Day!
                </div>
                <div className="heart"></div>
              </div>
              <div className="hearts">
                <div className="one"></div>
                <div className="two"></div>
                <div className="three"></div>
                <div className="four"></div>
                <div className="five"></div>
              </div>
            </div>
            <div className="shadow"></div>
          </div>
        </div>
      )}

      {/* Letter Form Modal */}
      <div className={`wrapperLetterForm ${showLetterForm ? 'show' : ''}`}>
        <div className="boxLetter">
          <i className="fa-solid fa-xmark" onClick={handleCloseForm}></i>
          <div className="formLetter">
            <div className="heartLetter">
              <div className="heartLetterItem"></div>
            </div>
            <div className="heartLetter">
              <div className="heartLetterItem"></div>
            </div>

            <div className="wrapperLetter">
              <div className="giftbox">
                <div className="img">
                  <Image src="/images/giftbox.png" alt="Gift box" width={180} height={180} />
                </div>
              </div>
              <div className="textLetter">
                <h2>{letterTitle}</h2>
                <p className="contentLetter">{letterContent}</p>
                <div className="heartAnimation">
                  <Image src="/images/heartAnimation.gif" alt="Heart animation" width={200} height={200} />
                </div>
              </div>
              <div className="mewmew1">
                <Image src="/images/mewmew.gif" alt="Mew mew" width={90} height={90} />
              </div>
              <div className="mewmew2">
                <Image src="/images/mewmew.gif" alt="Mew mew" width={90} height={90} />
              </div>
            </div>
          </div>
          <div className="before"></div>
        </div>
      </div>
    </>
  )
}

