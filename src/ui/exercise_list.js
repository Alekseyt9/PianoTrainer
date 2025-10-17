import { exerciseGroups } from '../data/exercises.js';
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

    exerciseGroups.forEach(group => {
        const groupSection = document.createElement('section');
        groupSection.className = 'exercise-group';

        const groupTitle = document.createElement('h3');
        groupTitle.className = 'exercise-group-title';
        groupTitle.textContent = group.title;
        groupSection.appendChild(groupTitle);

        const grid = document.createElement('div');
        grid.className = 'exercise-grid';

        group.exercises.forEach((exercise, index) => {
            const button = document.createElement('button');
            button.className = 'exercise-tile';
            button.type = 'button';
            button.dataset.exerciseId = exercise.id;

            const number = document.createElement('span');
            number.className = 'exercise-tile-number';
            number.textContent = String(index + 1);
            button.appendChild(number);

            button.addEventListener('click', () => {
                loadExerciseById(exercise.id);
            });

            grid.appendChild(button);
        });

        groupSection.appendChild(grid);
        listElement.appendChild(groupSection);
    });

    onExerciseChange(updateActiveExercise);
}

function updateActiveExercise({ exercise }) {
    if (!listElement) {
        return;
    }

    const activeId = exercise?.id;

    listElement.querySelectorAll('.exercise-tile').forEach(item => {
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
