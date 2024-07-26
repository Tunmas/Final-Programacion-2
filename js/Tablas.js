$(document).ready(function () {
    // Inicializar DataTables en la tabla con ID 'clientesTable'
    $('#clientesTable').DataTable({
        destroy: true,
        columnDefs: [
            { className: "centered", targets: [4] },
            { orderable: false, targets: [4] },
            { width: "6%", targets: [0] }
        ],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "Ningún usuario encontrado",
            info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Ningún usuario encontrado",
            infoFiltered: "(filtrados desde _MAX_ registros totales)",
            search: "Buscar:",
            loadingRecords: "Cargando...",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        },
        pageLength: 10
    });
});

// Variable para guardar la tabla
let dataTable;
let dataTableInicializada = false;

// Aquí se crea la tabla
async function initDataTable() {
    if (dataTableInicializada === true) {
        dataTable.destroy(); // Si hay una tabla creada la destruye
    }

    await lista();

    dataTable = $("#clientesTable").DataTable({
        destroy: true,
        columnDefs: [
            { className: "centered", targets: [4] },
            { orderable: false, targets: [4] },
            { width: "6%", targets: [0] }
        ],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "Ningún usuario encontrado",
            info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Ningún usuario encontrado",
            infoFiltered: "(filtrados desde _MAX_ registros totales)",
            search: "Buscar:",
            loadingRecords: "Cargando...",
            paginate: {
                first: "Primero",
                last: "Último",
                next: "Siguiente",
                previous: "Anterior"
            }
        },
        pageLength: 10
    });
    dataTableInicializada = true; // Se afirma que la tabla esta creada
}

// Toma los datos del formulario y los envía al servidor
$(document).ready(function () {
    // Poblar la lista de barrios
    fetch('http://localhost:3001/api/barrios')
        .then(response => response.json())
        .then(data => {
            const barrioSelect = document.getElementById('Barrio');
            data.forEach(barrio => {
                const option = document.createElement('option');
                option.value = barrio.id;
                option.textContent = barrio.nombre;
                barrioSelect.appendChild(option);
            });
        });

    document.getElementById('clienteForm').addEventListener('submit', function (e) {
        e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional

        const nombre = document.getElementById('Nombre').value;
        const apellido = document.getElementById('Apellido').value;
        const barrio = document.getElementById('Barrio').value;

        console.log(nombre, apellido, barrio);

        fetch('http://localhost:3000/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Nombre: nombre, Barrio: barrio, Apellido: apellido })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Cliente agregado con éxito!');
            // Limpiar el formulario
            document.getElementById('clienteForm').reset();
            initDataTable(); // Reinicializa la tabla para mostrar los nuevos datos
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error al agregar el cliente');
        });
    });
});
