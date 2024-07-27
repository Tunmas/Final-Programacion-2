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

    // Función para llenar la tabla con datos
    async function cargarClientes() {
        try {
            const response = await fetch('http://localhost:3000/api/clientes');
            const clientes = await response.json();
            
            // Obtener la tabla
            const tabla = $('#clientesTable').DataTable();
            
            // Limpiar la tabla
            tabla.clear();
            
            // Llenar la tabla
            clientes.forEach(cliente => {
                tabla.row.add([
                    cliente.id,
                    `${cliente.apellido} ${cliente.nombre}`,
                    cliente.barrio,
                    cliente.activo ? 'Activo' : 'Inactivo',
                    `<button class="btn btn-sm ${cliente.activo ? 'btn-danger' : 'btn-success'}  cambiar-estado">${cliente.activo ? "Desactivar" : "Activar"}</button>`
                ]).draw();
            });
        } catch (error) {
            console.error('Error al cargar los clientes:', error);
        }
    }
    // Llamar a la función para cargar los clientes al iniciar
    cargarClientes();

    $('#clientesTable').on('click', '.cambiar-estado', function () {        
        // Obtener la fila del cliente usando el id
        const tabla = $('#clientesTable').DataTable();
        const fila = tabla.row($(this).parents('tr')).data();

        const id = fila[0];
        const estadoActual = fila[3];

        const nuevoEstado = estadoActual === "Activo" ? false : true;

        console.log(id);
        console.log(estadoActual);
        console.log(nuevoEstado);
        console.log('Datos de la Fila:', fila);

        fetch(`http://localhost:3000/api/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ activo: nuevoEstado })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Cliente actualizado con éxito!');
            cargarClientes(); // Reinicializa la tabla para mostrar los nuevos datos
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Error al actualizar el cliente');
        });
    });

    // Poblar la lista de barrios
    fetch('http://localhost:3001/api/barrios')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Verifica la estructura de los datos
            const barrioSelect = document.getElementById('Barrio');
            data.forEach(barrio => {
                console.log(barrio);
                const option = document.createElement('option');
                option.value = barrio.nombrebarrio; 
                option.textContent = barrio.nombrebarrio; 
                barrioSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener los barrios:', error));

    document.getElementById('clienteForm').addEventListener('submit', function (e) {
        e.preventDefault();

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

            document.getElementById('clienteForm').reset();
            cargarClientes(); // Reinicializa la tabla para mostrar los nuevos datos
        })

        .catch((error) => {
            console.error('Error:', error);
            alert('Error al agregar el cliente');
        });
    });
});
