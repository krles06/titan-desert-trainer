export const RACES = [
    {
        id: 'morocco-2026',
        name: 'Škoda Morocco Titan Desert',
        location: 'Marruecos',
        date: '2026-04-26',
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
        distance_total: 350,
        stages: 5,
        difficulty: 'Alta',
        color: 'titan-blue',
        image_prompt: 'mountain biker in tabernas desert almeria spain titan desert'
    }
]

export function getRaceById(id) {
    return RACES.find(r => r.id === id) || RACES[0]
}
