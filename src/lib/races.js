export const RACES = [
    {
        id: 'morocco-2026',
        name: 'Škoda Morocco Titan Desert',
        location: 'Marruecos',
        date: '2026-04-26',
        end_date: '2026-05-01',
        distance_total: 600,
        stages: 6,
        difficulty: 'Extrema',
        color: 'titan-orange',
        image_prompt: 'mountain biker in sahara desert dunes titan desert morocco marathon'
    },
    {
        id: 'almeria-2026',
        name: 'Titan Desert Almería',
        location: 'Almería, España',
        date: '2026-10-01',
        end_date: '2026-10-04',
        distance_total: 350,
        stages: 4,
        difficulty: 'Alta',
        color: 'dunr-orange',
        image_prompt: 'mountain biker in tabernas desert almeria spain titan desert'
    }
]

export function isRaceSelectable(race, referenceDate = new Date()) {
    if (!race?.date) return false
    const raceStart = new Date(`${race.date}T00:00:00`)
    return raceStart > referenceDate
}

export function getUpcomingRaces(referenceDate = new Date()) {
    return RACES.filter((race) => isRaceSelectable(race, referenceDate))
}

export function getDefaultRace(referenceDate = new Date()) {
    return getUpcomingRaces(referenceDate)[0] || RACES[RACES.length - 1]
}

export function getRaceById(id) {
    return RACES.find(r => r.id === id) || getDefaultRace()
}
