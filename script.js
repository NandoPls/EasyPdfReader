// script.js

document.addEventListener('DOMContentLoaded', () => {
    const libros = document.querySelectorAll('.libro');
    const modal = document.getElementById('modal');
    const closeModal = document.getElementById('close-modal');
    const pdfRender = document.getElementById('pdf-render');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;
    let selectedLibro = '';

    const url = './libros/';

    // Evento para seleccionar un libro y abrir el modal
    libros.forEach(libro => {
        libro.addEventListener('click', () => {
            selectedLibro = libro.getAttribute('data-libro');
            openModal();
        });
    });

    // Evento para cerrar el modal
    closeModal.addEventListener('click', closeModalFunction);
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            closeModalFunction();
        }
    });

    // Eventos para navegación de páginas
    prevPageBtn.addEventListener('click', () => {
        if (currentPage <= 1) return;
        currentPage--;
        renderPage(currentPage);
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage >= totalPages) return;
        currentPage++;
        renderPage(currentPage);
    });

    // Evento para togglear el modo oscuro
    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Función para abrir el modal y cargar el PDF
    function openModal() {
        modal.style.display = 'block';
        const savedPage = localStorage.getItem(selectedLibro);
        currentPage = savedPage ? parseInt(savedPage) : 1;
        const pdfPath = url + selectedLibro;
        pdfjsLib.getDocument(pdfPath).promise.then(pdf => {
            pdfDoc = pdf;
            totalPages = pdf.numPages;
            totalPagesEl.textContent = totalPages;
            renderPage(currentPage);
        }).catch(err => {
            console.error('Error al cargar el PDF:', err);
        });
    }

    // Función para cerrar el modal
    function closeModalFunction() {
        modal.style.display = 'none';
        if (pdfDoc) {
            pdfDoc.destroy();
            pdfDoc = null;
        }
    }

    // Función para renderizar una página del PDF
    function renderPage(num) {
        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = pdfRender;
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };

            page.render(renderContext).promise.then(() => {
                currentPageEl.textContent = num;
                // Guardar la página actual en localStorage
                localStorage.setItem(selectedLibro, num);
            });
        });
    }

    // Guardar la última página cuando el usuario sale
    window.addEventListener('beforeunload', () => {
        if (selectedLibro) {
            localStorage.setItem(selectedLibro, currentPage);
        }
    });

    // Agregar gestos de deslizamiento para dispositivos táctiles
    const readerContainer = document.getElementById('reader-container');
    let touchStartX = 0;
    let touchEndX = 0;

    readerContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    readerContainer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleGesture();
    }, false);

    function handleGesture() {
        if (touchEndX < touchStartX - 50) {
            // Deslizar a la izquierda
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
            }
        }
        if (touchEndX > touchStartX + 50) {
            // Deslizar a la derecha
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        }
    }
});
