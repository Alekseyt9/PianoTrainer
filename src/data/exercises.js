const groupedExercises = [
    {
        id: 'warmup',
        title: 'Разогрев пальцев',
        exercises: [
            {
                id: 'warmup-middle-c',
                title: 'Middle C Focus',
                description: 'Повторяй ноту C4 и соседние белые клавиши для разогрева.',
                displayWindow: 4,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [60], label: 'C4' },
                    { notes: [64], label: 'E4' }
                ],
                loop: true
            },
            {
                id: 'warmup-steps-up',
                title: 'Step Up',
                description: 'Пройди по белым клавишам от C4 до F4.',
                displayWindow: 4,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [65], label: 'F4' }
                ],
                loop: true
            },
            {
                id: 'warmup-steps-down',
                title: 'Step Down',
                description: 'Спустись обратно от F4 к C4.',
                displayWindow: 4,
                steps: [
                    { notes: [65], label: 'F4' },
                    { notes: [64], label: 'E4' },
                    { notes: [62], label: 'D4' },
                    { notes: [60], label: 'C4' }
                ],
                loop: true
            },
            {
                id: 'warmup-skip',
                title: 'Skip Practice',
                description: 'Чередуй секунды и терции вокруг C4.',
                displayWindow: 4,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [64], label: 'E4' },
                    { notes: [62], label: 'D4' },
                    { notes: [65], label: 'F4' }
                ],
                loop: true
            }
        ]
    },
    {
        id: 'intervals',
        title: 'Простые интервалы',
        exercises: [
            {
                id: 'intervals-thirds-c',
                title: 'Thirds in C',
                description: 'Пропрощай мажорные и минорные терции от C4.',
                displayWindow: 4,
                steps: [
                    { notes: [60, 64], label: 'C4-E4' },
                    { notes: [62, 65], label: 'D4-F4' },
                    { notes: [64, 67], label: 'E4-G4' },
                    { notes: [62, 65], label: 'D4-F4' }
                ],
                loop: true
            },
            {
                id: 'intervals-fifths',
                title: 'Simple Fifths',
                description: 'Строй устойчивые квинты на белых клавишах.',
                displayWindow: 3,
                steps: [
                    { notes: [60, 67], label: 'C4-G4' },
                    { notes: [62, 69], label: 'D4-A4' },
                    { notes: [64, 71], label: 'E4-B4' }
                ],
                loop: true
            },
            {
                id: 'intervals-echo',
                title: 'Echo Interval',
                description: 'Повторяй интервал терции в разных октавах.',
                displayWindow: 4,
                steps: [
                    { notes: [48, 52], label: 'C3-E3' },
                    { notes: [60, 64], label: 'C4-E4' },
                    { notes: [72, 76], label: 'C5-E5' },
                    { notes: [60, 64], label: 'C4-E4' }
                ],
                loop: false
            }
        ]
    },
    {
        id: 'white-keys',
        title: 'Белые клавиши',
        exercises: [
            {
                id: 'white-cde',
                title: 'C-D-E Line',
                description: 'Лёгкая мелодия по трём белым клавишам.',
                displayWindow: 3,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' }
                ],
                loop: true
            },
            {
                id: 'white-echo',
                title: 'Echo Motion',
                description: 'Повторяй восходящую и нисходящую фразу.',
                displayWindow: 4,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [62], label: 'D4' }
                ],
                loop: true
            },
            {
                id: 'white-c-major-frag',
                title: 'C Major Fragment',
                description: 'Мини-участок гаммы C мажор.',
                displayWindow: 5,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [65], label: 'F4' },
                    { notes: [67], label: 'G4' }
                ],
                loop: true
            },
            {
                id: 'white-descend',
                title: 'Descending Five',
                description: 'Спуск от G4 до C4.',
                displayWindow: 5,
                steps: [
                    { notes: [67], label: 'G4' },
                    { notes: [65], label: 'F4' },
                    { notes: [64], label: 'E4' },
                    { notes: [62], label: 'D4' },
                    { notes: [60], label: 'C4' }
                ],
                loop: true
            },
            {
                id: 'white-pattern',
                title: 'White Key Pattern',
                description: 'Попеременно играй ноты C, E и G.',
                displayWindow: 3,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [64], label: 'E4' },
                    { notes: [67], label: 'G4' }
                ],
                loop: true
            }
        ]
    },
    {
        id: 'starter-scales',
        title: 'Начальные гаммы',
        exercises: [
            {
                id: 'scale-c-one-octave',
                title: 'C Major 1 Octave',
                description: 'Возьми одну октаву C мажор вверх и вниз.',
                displayWindow: 6,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [65], label: 'F4' },
                    { notes: [67], label: 'G4' },
                    { notes: [69], label: 'A4' },
                    { notes: [71], label: 'B4' },
                    { notes: [72], label: 'C5' },
                    { notes: [71], label: 'B4' },
                    { notes: [69], label: 'A4' },
                    { notes: [67], label: 'G4' },
                    { notes: [65], label: 'F4' },
                    { notes: [64], label: 'E4' },
                    { notes: [62], label: 'D4' },
                    { notes: [60], label: 'C4' }
                ],
                loop: false
            },
            {
                id: 'scale-g-fragment',
                title: 'G Major Fragment',
                description: 'Короткий фрагмент гаммы G мажор с одним диезом.',
                displayWindow: 6,
                steps: [
                    { notes: [55], label: 'G3' },
                    { notes: [57], label: 'A3' },
                    { notes: [59], label: 'B3' },
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [66], label: 'F#4' },
                    { notes: [67], label: 'G4' }
                ],
                loop: false
            },
            {
                id: 'scale-f-fragment',
                title: 'F Major Fragment',
                description: 'Гамма F мажор с бемолем B♭.',
                displayWindow: 6,
                steps: [
                    { notes: [53], label: 'F3' },
                    { notes: [55], label: 'G3' },
                    { notes: [57], label: 'A3' },
                    { notes: [58], label: 'Bb3' },
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [65], label: 'F4' }
                ],
                loop: false
            },
            {
                id: 'scale-c-wide',
                title: 'C Major Wide',
                description: 'Две октавы гаммы C мажор.',
                displayWindow: 8,
                steps: [
                    { notes: [48], label: 'C3' },
                    { notes: [50], label: 'D3' },
                    { notes: [52], label: 'E3' },
                    { notes: [53], label: 'F3' },
                    { notes: [55], label: 'G3' },
                    { notes: [57], label: 'A3' },
                    { notes: [59], label: 'B3' },
                    { notes: [60], label: 'C4' },
                    { notes: [62], label: 'D4' },
                    { notes: [64], label: 'E4' },
                    { notes: [65], label: 'F4' },
                    { notes: [67], label: 'G4' },
                    { notes: [69], label: 'A4' },
                    { notes: [71], label: 'B4' },
                    { notes: [72], label: 'C5' },
                    { notes: [74], label: 'D5' },
                    { notes: [76], label: 'E5' },
                    { notes: [77], label: 'F5' },
                    { notes: [79], label: 'G5' },
                    { notes: [81], label: 'A5' },
                    { notes: [83], label: 'B5' },
                    { notes: [84], label: 'C6' }
                ],
                loop: false
            }
        ]
    },
    {
        id: 'patterns',
        title: 'Паттерны и арпеджио',
        exercises: [
            {
                id: 'pattern-triad-c',
                title: 'C Triad Broken',
                description: 'Пройди арпеджио C мажор по белым клавишам.',
                displayWindow: 4,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [64], label: 'E4' },
                    { notes: [67], label: 'G4' },
                    { notes: [72], label: 'C5' }
                ],
                loop: true
            },
            {
                id: 'pattern-triad-f',
                title: 'F Triad Broken',
                description: 'Арпеджио F мажор с верхней октавой.',
                displayWindow: 4,
                steps: [
                    { notes: [53], label: 'F3' },
                    { notes: [60], label: 'C4' },
                    { notes: [65], label: 'F4' },
                    { notes: [69], label: 'A4' }
                ],
                loop: true
            },
            {
                id: 'pattern-triplet',
                title: 'Triplet Motion',
                description: 'Попробуй паттерн из трёх нот с переносом вверх.',
                displayWindow: 6,
                steps: [
                    { notes: [60], label: 'C4' },
                    { notes: [64], label: 'E4' },
                    { notes: [67], label: 'G4' },
                    { notes: [64], label: 'E4' },
                    { notes: [67], label: 'G4' },
                    { notes: [72], label: 'C5' },
                    { notes: [67], label: 'G4' },
                    { notes: [72], label: 'C5' },
                    { notes: [76], label: 'E5' }
                ],
                loop: false
            }
        ]
    }
];

export const exerciseGroups = groupedExercises;
export const exercises = groupedExercises.flatMap(group => group.exercises);

