const COLOR_STYLES = {
    light: {
        mark: 'text-white',
        accent: 'text-dunr-orange',
        word: 'text-white',
    },
    dark: {
        mark: 'text-black',
        accent: 'text-dunr-orange',
        word: 'text-black',
    },
    muted: {
        mark: 'text-white/80',
        accent: 'text-dunr-orange',
        word: 'text-white/80',
    },
}

function DunrMark({ src, className = '', title = 'DUNR' }) {
    return (
        <img
            src={src}
            alt={title}
            className={className}
        />
    )
}

function getMarkSrc(color) {
    if (color === 'dark') return '/brand/dunr-logo-option-5-black.png'
    return '/brand/dunr-logo-option-5-white.png'
}

export default function DunrLogo({
    variant = 'lockup',
    color = 'light',
    className = '',
    markClassName = '',
    wordClassName = '',
}) {
    const palette = COLOR_STYLES[color] || COLOR_STYLES.light
    const markSrc = getMarkSrc(color)

    if (variant === 'mark') {
        return (
            <img
                src={markSrc}
                alt="DUNR logo"
                className={className || markClassName}
            />
        )
    }

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <DunrMark src={markSrc} className={`h-8 w-auto shrink-0 ${markClassName}`} title="DUNR logo" />
            <span className={`font-black italic tracking-tight leading-none ${palette.word} ${wordClassName}`}>
                DUNR
            </span>
        </div>
    )
}
