declare module 'animejs' {
  interface AnimeParams {
    targets?: string | Element | Element[] | NodeList | string[]
    duration?: number
    delay?: number
    endDelay?: number
    easing?: string
    round?: number | boolean
    begin?: (anim: any) => void
    update?: (anim: any) => void
    complete?: (anim: any) => void
    autoplay?: boolean
    loop?: number | boolean
    direction?: 'normal' | 'reverse' | 'alternate'
    strokeDashoffset?: any
    [key: string]: any
  }

  interface AnimeInstance {
    play(): void
    pause(): void
    restart(): void
    reverse(): void
    seek(time: number): void
    finished: Promise<void>
  }

  interface AnimeStatic {
    (params: AnimeParams): AnimeInstance
    setDashoffset(el: Element | string): number
    timeline(params?: AnimeParams): any
    remove(targets: string | Element | Element[]): void
    get(targets: string | Element, prop: string): string
    path(path: string | Element): (prop: string) => { el: Element; property: string; totalLength: number }
    random(min: number, max: number): number
  }

  const anime: AnimeStatic
  export default anime
}

