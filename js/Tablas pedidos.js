$(document).ready(function () {
    // Inicializar DataTables en la tabla con ID 'pedidosTable'
    $('#pedidosTable').DataTable({
        destroy: true,
        columnDefs: [
            { className: "centered", targets: [4] },
            { orderable: false, targets: [4] },
            { width: "1%", targets: [0] },
            { width: "10%", targets: [4] }
        ],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "Ningún pedido encontrado",
            info: "Mostrando de _START_ a _END_ de un total de _TOTAL_ registros",
            infoEmpty: "Ningún pedido encontrado",
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

    async function obtenerEstadoClientePorNombre(nombreCompleto) {
        try {
            const [apellido, nombre] = nombreCompleto.split(' ');
            
            if (!nombre || !apellido) {
                throw new Error('Nombre completo debe contener nombre y apellido');
            }
            
            console.log('Nombre:', nombre);
            console.log('Apellido:', apellido);
    
            const response = await fetch(`http://localhost:3003/api/cliente?nombre=${encodeURIComponent(nombre)}&apellido=${encodeURIComponent(apellido)}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const cliente = await response.json();
            return cliente.activo;
        } catch (error) {
            console.error('Error al obtener el estado del cliente:', error);
            return null;
        }
    }
    
    
    
    async function cargarPedidos() {
        try {
            const response = await fetch('http://localhost:3003/api/pedidos');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const pedidos = await response.json();
            const tabla = $('#pedidosTable').DataTable();
            tabla.clear();
    
            for (const pedido of pedidos) {
                const estadoCliente = await obtenerEstadoClientePorNombre(pedido.cliente);
        
                if (estadoCliente === true) {
                    const fechaForma = formatoFecha(pedido.fecha);
                    tabla.row.add([
                        pedido.id,
                        fechaForma,
                        pedido.cliente,
                        pedido.articulo,
                        "$ "+ pedido.precio,
                        pedido.cantidad,
                        pedido.total,
                        `<button class="btn btn-sm btn-primary cambiar-cantidad">Modificar cantidad</button>`
                    ]).draw();
                }
            }
        } catch (error) {
            console.error('Error al cargar los pedidos:', error);
        }
    }
    // Llamar a la función para cargar los pedidos al iniciar
    cargarPedidos();

    function formatoFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        const dia = String(fecha.getDate()).padStart(2,'0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const year = fecha.getFullYear();
        console.log(`${dia}-${mes}-${year}`);
        return `${dia}-${mes}-${year}`;
    }
    

    // Autocompletar para el campo Cliente
    $("#Cliente").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://localhost:3000/api/clientes2",
                type: "GET",
                data: { term: request.term }, 
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.apellido + " " + item.nombre,
                            value: item.apellido + " " + item.nombre
                        };
                    }));
                }
            });
        },
        select: function (event, ui) {
            console.log("Selected: " + ui.item.value);
        }
    });
    $("#NombreArticulo").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "http://localhost:3002/api/productos",
                type: "GET",
                data: { term: request.term },
                success: function (data) {
                    response($.map(data, function (item) {
                        return {
                            label: item.nombrearticulo,  // label se muestra en la lista desplegable
                            value: item.nombrearticulo,   // value se usa para la selección
                            descripcion: item.idarticulo
                        };
                    }));
                }
            });
        },
        select: function (event, ui) {
            // Cuando se selecciona un ítem del autocompletado, obtén el precio del artículo
            $.ajax({
                url: `http://localhost:3002/api/precios/${ui.item.descripcion}`, // Usa el idarticulo para obtener el precio
                type: "GET",
                success: function (data) {
                    // Actualiza el campo de precio con el valor obtenido
                    $("#Precio").val(data.precio);
                },
                error: function (xhr, status, error) {
                    console.error('Error al obtener el precio:', status, error);
                }
            });
        }
    });

    $('#pedidosTable').on('click', '.cambiar-cantidad', function () {        
        // Obtener la fila del pedido usando el id
        const tabla = $('#pedidosTable').DataTable();
        const fila = tabla.row($(this).parents('tr')).data();
    
        const id = fila[0];
        const cantidad = fila[5];
    
        // Mostrar prompt para ingresar nueva cantidad
        const nuevaCantidad = prompt('Ingrese la nueva cantidad:', cantidad);

        console.log(id, cantidad, nuevaCantidad);
    
        // Verificar que se ha ingresado una nueva cantidad y que es un número válido
        if (nuevaCantidad !== null && !isNaN(nuevaCantidad) && Number.isInteger(parseFloat(nuevaCantidad)) && parseInt(nuevaCantidad) >= 0) {
            // Enviar la actualización al servidor
            fetch(`http://localhost:3003/api/pedidos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cantidad: parseInt(nuevaCantidad, 10) })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert('Pedido actualizado con éxito!');
                cargarPedidos(); // Reinicializa la tabla para mostrar los nuevos datos
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Error al actualizar el pedido');
            });
        } else {
            alert('Cantidad inválida. Debe ser un número entero positivo.');
        }
    });
    

    document.getElementById('pedidoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const cliente = document.getElementById('Cliente').value;
        const articulo = document.getElementById('NombreArticulo').value;
        const precio = document.getElementById('Precio').value;        
        const cantidad = document.getElementById('Cantidad').value;
        const fecha = new Date().toLocaleDateString('en-CA');


        console.log(fecha, cliente, articulo, precio, cantidad);

        fetch('http://localhost:3003/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Fecha: fecha, Cliente: cliente, Articulo: articulo, Precio: precio, Cantidad: cantidad })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Pedido agregado con éxito!');

            document.getElementById('pedidoForm').reset();
            cargarPedidos(); // Reinicializa la tabla para mostrar los nuevos datos
        })

        .catch((error) => {
            console.error('Error:', error);
            alert('Error al agregar el cliente');
        });
    });
});