
        const svg1 = document.getElementById('notation');
        //const xmlns = "http://www.w3.org/2000/svg";
        let notes = [];

        function createNote(y) {
            const note = document.createElementNS(xmlns, 'circle');
            note.setAttribute('cx', '500');  // начальное положение по оси X (справа)
            note.setAttribute('cy', y);
            note.setAttribute('r', '10');
            note.setAttribute('fill', 'black');
            svg1.appendChild(note);
            return note;
        }

        function animate() {
            notes.forEach(note => {
                const cx = parseFloat(note.getAttribute('cx')) - 2;  // скорость движения нот
                if (cx > 10) {  // остановка ноты при достижении левого края
                    note.setAttribute('cx', cx);
                }
            });
            requestAnimationFrame(animate);
        }

        function generateNotes() {
            const staffLines = [40, 60, 80, 100, 120, 140, 160, 180, 200, 220];
            staffLines.forEach(y => {
                const note = createNote(y);
                notes.push(note);
            });
        }

        generateNotes();
        animate();