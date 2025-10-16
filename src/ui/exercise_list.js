import { exercises } from '../data/exercises.js';
import { loadExerciseById, onExerciseChange } from '../core/exercise.js';

let listElement = null;
let titleElement = null;
let descriptionElement = null;

export function initExerciseList() {
    listElement = document.getElementById('exercise-list');
    titleElement = document.getElementById('exercise-details-title');
    descriptionElement = document.getElementById('exercise-details-description');

    if (!listElement) {
        return;
    }

    listElement.innerHTML = '';

    exercises.forEach(exercise => {
        const button = document.createElement('button');
        button.className = 'exercise-item';
        button.type = 'button';
        button.dataset.exerciseId = exercise.id;

        const title = document.createElement('span');
        title.className = 'exercise-item-title';
        title.textContent = exercise.title;

        button.appendChild(title);

        button.addEventListener('click', () => {
            loadExerciseById(exercise.id);
        });

        listElement.appendChild(button);
    });

    onExerciseChange(updateActiveExercise);
}

function updateActiveExercise({ exercise }) {
    if (!listElement) {
        return;
    }

    const activeId = exercise?.id;

    listElement.querySelectorAll('.exercise-item').forEach(item => {
        const isActive = item.dataset.exerciseId === activeId;
        item.classList.toggle('active', isActive);
    });

    if (titleElement) {
        titleElement.textContent = exercise ? exercise.title : '';
    }
    if (descriptionElement) {
        descriptionElement.textContent = exercise ? exercise.description : '';
    }
}
