$(document).ready(function () {
    // Inicializar DataTables en la tabla con ID 'pedidosTable'
    $('#pedidosTable').DataTable({
        destroy: true,
        columnDefs: [
            { className: "centered", targets: [4] },
            { orderable: false, targets: [4] },
            { width: "6%", targets: [0] }
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

    async function cargarPedidos() {
        try {
            const response = await fetch('http://localhost:3003/api/pedidos');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const pedidos = await response.json();
            const tabla = $('#pedidosTable').DataTable();
            tabla.clear();
            pedidos.forEach(pedido => {
                tabla.row.add([
                    pedido.id,
                    pedido.fecha,
                    pedido.cliente,
                    pedido.articulo,
                    pedido.precio,
                    pedido.cantidad,
                    pedido.total,
                    pedido.total
                ]).draw();
            });
        } catch (error) {
            console.error('Error al cargar los pedidos:', error);
        }
    }
    
    // Llamar a la función para cargar los pedidos al iniciar
    cargarPedidos();
    

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
                            label: item.nombre + " " + item.apellido,
                            value: item.nombre + " " + item.apellido
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

    document.getElementById('pedidoForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const cliente = document.getElementById('Cliente').value;
        const articulo = document.getElementById('NombreArticulo').value;
        const precio = document.getElementById('Precio').value;        
        const cantidad = document.getElementById('Cantidad').value;
        const fecha = new Date().toISOString().split('T')[0];


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
            //cargarClientes(); // Reinicializa la tabla para mostrar los nuevos datos
        })

        .catch((error) => {
            console.error('Error:', error);
            alert('Error al agregar el cliente');
        });
    });
});