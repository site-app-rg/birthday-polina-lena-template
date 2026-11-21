export type AlbumPhoto = { id: string; src: string; alt: string; position?: string }
export const mediaPath = (filename: string) => `${import.meta.env.BASE_URL}media/${filename}`
// Все 23 фотографии Полины подключены к просмотру альбома, включая снимок 13.
export const albumPhotos: AlbumPhoto[] = Array.from({ length: 23 }, (_, index) => { const id = String(index + 1).padStart(2, '0'); return { id, src: mediaPath(`polina-${id}.jpg`), alt: `Фотография Полины ${index + 1}` } })
export const surprisePhoto = albumPhotos[22]
export const mainSong = ''
export const surpriseSong = ''
// Поздравление клиентки: исправлены пробелы и пунктуация, текст разбит на абзацы.
export const letterParagraphs = [
'Дорогая моя! Хочу поздравить тебя с днём рождения!',
'Пожелать тебе хочется много и ещё больше. Счастья громадного, успехов всевозможных, любви бездонной.',
'Чтобы в твоём доме царили покой и уют, а ты всегда находила желание и силы их поддерживать и создавать. Чтобы несчастья и горести всегда обходили тебя стороной.',
'А ты была почаще весела и беспечна, твой задорный, искристый смех звучал как можно чаще.',
'Достатка тебе желаю огромного. Пусть без труда решаются проблемы. Да просто чтобы жизнь была без них.',
'Очень тебя люблю! Спасибо за твою дружбу и поддержку! Ещё раз с днём рождения тебя!'
]
